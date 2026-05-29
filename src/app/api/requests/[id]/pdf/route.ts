import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { REQUEST_DOCS_BUCKET } from "@/lib/pdf/upload";
import { finalizeRequestPdf } from "@/actions/approvals";

export const dynamic = "force-dynamic";

function isObjectNotFound(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { statusCode?: string | number; status?: number; message?: string };
  const code = String(e.statusCode ?? "");
  return (
    code === "404" ||
    e.status === 404 ||
    /not\s*found/i.test(e.message ?? "")
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RLS will allow the request to be visible only to its owner or master-view roles.
  const { data: req, error } = await supabase
    .from("requests")
    .select("id, document_path, hr_approval, section_head_approval")
    .eq("id", id)
    .single();
  if (error || !req) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  let documentPath = req.document_path;

  const fullyApproved =
    req.hr_approval === "approved" && req.section_head_approval === "approved";

  // Helper: pull the PDF bytes for a given storage path.
  async function loadFromStorage(path: string) {
    return admin.storage.from(REQUEST_DOCS_BUCKET).download(path);
  }

  if (!documentPath) {
    // Nothing stamped on the row yet. If the request is approved we can build
    // it on demand; otherwise return the original "not generated" error.
    if (!fullyApproved) {
      return NextResponse.json(
        { error: "Document not yet generated" },
        { status: 409 },
      );
    }
    try {
      documentPath = await finalizeRequestPdf(req.id);
    } catch (e) {
      console.error("[requests.pdf] On-demand generation failed", e);
      return NextResponse.json(
        { error: "Document generation failed" },
        { status: 500 },
      );
    }
  }

  let { data: file, error: downloadError } = await loadFromStorage(documentPath);

  // Self-heal: the row points at a path that is missing from storage (e.g.
  // bucket was cleared, or the DB row was migrated from a different Supabase
  // project than the one this deploy is pointing at). Rebuild and retry.
  if ((downloadError || !file) && isObjectNotFound(downloadError) && fullyApproved) {
    console.warn(
      "[requests.pdf] Object missing in storage, regenerating",
      { id: req.id, path: documentPath },
    );
    try {
      documentPath = await finalizeRequestPdf(req.id);
      ({ data: file, error: downloadError } = await loadFromStorage(documentPath));
    } catch (regenErr) {
      console.error("[requests.pdf] Auto-regeneration failed", regenErr);
    }
  }

  if (downloadError || !file) {
    console.error("[requests.pdf] Failed to download PDF", downloadError);
    return NextResponse.json(
      { error: "Document download failed" },
      { status: 500 },
    );
  }

  const filename = `request-${req.id}.pdf`;
  const buffer = await file.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
