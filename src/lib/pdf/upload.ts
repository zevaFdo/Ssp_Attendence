import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const REQUEST_DOCS_BUCKET = "request-documents";

export async function uploadRequestPdf(
  buffer: Buffer,
  userId: string,
  requestId: string,
) {
  const path = `${userId}/${requestId}.pdf`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(REQUEST_DOCS_BUCKET)
    .upload(path, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) throw error;
  return path;
}

export async function createSignedUrl(path: string, expiresIn = 60 * 5) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(REQUEST_DOCS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
