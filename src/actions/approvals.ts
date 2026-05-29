"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  canApproveAsHR,
  canApproveAsSectionHead,
} from "@/lib/auth/permissions";
import { approvalDecisionSchema } from "@/lib/validations/requests";
import { buildRequestPdf } from "@/lib/pdf/generator";
import { uploadRequestPdf } from "@/lib/pdf/upload";
import { isLocale, type Locale } from "@/i18n/config";
import type { Profile } from "@/types/app";

async function loadActor(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return (data ?? null) as Profile | null;
}

export async function hrDecide(formData: FormData) {
  const tErr = await getTranslations("errors");
  const parsed = approvalDecisionSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) return { error: tErr("invalidDecision") };

  const actor = await loadActor();
  if (!canApproveAsHR(actor?.role)) return { error: tErr("forbidden") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({ hr_approval: parsed.data.decision })
    .eq("id", parsed.data.requestId);
  if (error) return { error: error.message };

  revalidatePath("/approvals");
  revalidatePath(`/requests/${parsed.data.requestId}`);
  return { ok: true as const };
}

export async function sectionHeadDecide(formData: FormData) {
  const tErr = await getTranslations("errors");
  const parsed = approvalDecisionSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) return { error: tErr("invalidDecision") };

  const actor = await loadActor();
  if (!canApproveAsSectionHead(actor?.role)) return { error: tErr("forbidden") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update({ section_head_approval: parsed.data.decision })
    .eq("id", parsed.data.requestId);
  if (error) return { error: error.message };

  // If fully approved, generate PDF, upload, and store the path.
  if (parsed.data.decision === "approved") {
    try {
      await finalizeRequestPdf(parsed.data.requestId);
    } catch (e) {
      console.error("[approvals] PDF generation failed", e);
      revalidatePath("/approvals");
      revalidatePath(`/requests/${parsed.data.requestId}`);
      // Notify the actor; the request is still approved either way.
      return {
        ok: true as const,
        warning: tErr("approvedPdfFailed"),
      };
    }
  }

  revalidatePath("/approvals");
  revalidatePath(`/requests/${parsed.data.requestId}`);
  return { ok: true as const };
}

/**
 * Idempotent: builds and uploads the PDF for a fully-approved request,
 * then stamps `document_path` on the row. Uses the admin client to bypass
 * RLS column guards (only HR/SH may UPDATE requests, but the path column
 * is locked from HR; admin client sidesteps both).
 */
export async function finalizeRequestPdf(requestId: string) {
  const admin = createAdminClient();

  const { data: req, error } = await admin
    .from("requests")
    .select(
      `id, type, date, reason, created_at,
       hr_approval, hr_approved_at, hr_approved_by,
       section_head_approval, section_head_approved_at, section_head_approved_by,
       user_id`,
    )
    .eq("id", requestId)
    .single();
  if (error || !req) throw error ?? new Error("Request not found");

  if (req.hr_approval !== "approved" || req.section_head_approval !== "approved") {
    throw new Error("Request is not fully approved yet");
  }

  const { data: employee } = await admin
    .from("profiles")
    .select("full_name, email, role, section_id, team_id, preferred_language")
    .eq("id", req.user_id)
    .single();
  if (!employee) throw new Error("Employee profile not found");

  const [{ data: hr }, { data: sh }, { data: section }, { data: team }] =
    await Promise.all([
      req.hr_approved_by
        ? admin.from("profiles").select("full_name").eq("id", req.hr_approved_by).single()
        : Promise.resolve({ data: null }),
      req.section_head_approved_by
        ? admin
            .from("profiles")
            .select("full_name")
            .eq("id", req.section_head_approved_by)
            .single()
        : Promise.resolve({ data: null }),
      employee.section_id
        ? admin.from("sections").select("name").eq("id", employee.section_id).single()
        : Promise.resolve({ data: null }),
      employee.team_id
        ? admin.from("teams").select("name").eq("id", employee.team_id).single()
        : Promise.resolve({ data: null }),
    ]);

  const locale: Locale = isLocale(employee.preferred_language)
    ? employee.preferred_language
    : "ja";

  const pdf = await buildRequestPdf({
    locale,
    request: {
      id: req.id,
      type: req.type,
      date: req.date,
      reason: req.reason,
      created_at: req.created_at,
      hr_approved_at: req.hr_approved_at,
      section_head_approved_at: req.section_head_approved_at,
    },
    employee: {
      full_name: employee.full_name,
      email: employee.email,
      role: employee.role,
    },
    hrApprover: hr ? { full_name: hr.full_name } : null,
    sectionHeadApprover: sh ? { full_name: sh.full_name } : null,
    section: section ? { name: section.name } : null,
    team: team ? { name: team.name } : null,
  });

  const path = await uploadRequestPdf(pdf, req.user_id, req.id);

  const { error: upErr } = await admin
    .from("requests")
    .update({ document_path: path })
    .eq("id", req.id);
  if (upErr) throw upErr;

  return path;
}

export async function regeneratePdf(formData: FormData) {
  const tErr = await getTranslations("errors");
  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return { error: tErr("missingRequestId") };
  const actor = await loadActor();
  if (
    !actor ||
    !(actor.role === "admin" ||
      actor.role === "hr_supervisor" ||
      actor.role === "section_head")
  ) {
    return { error: tErr("forbidden") };
  }
  try {
    await finalizeRequestPdf(requestId);
    revalidatePath(`/requests/${requestId}`);
    return { ok: true as const };
  } catch (e) {
    return { error: e instanceof Error ? e.message : tErr("failed") };
  }
}
