import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { REQUEST_DOCS_BUCKET } from "@/lib/pdf/upload";

export const dynamic = "force-dynamic";

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
    .select("id, document_path")
    .eq("id", id)
    .single();
  if (error || !req) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!req.document_path) {
    return NextResponse.json(
      { error: "Document not yet generated" },
      { status: 409 },
    );
  }

  const admin = createAdminClient();
  const { data: file, error: downloadError } = await admin.storage
    .from(REQUEST_DOCS_BUCKET)
    .download(req.document_path);

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
