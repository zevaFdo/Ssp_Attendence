import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/pdf/upload";

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

  const url = await createSignedUrl(req.document_path, 60);
  return NextResponse.redirect(url);
}
