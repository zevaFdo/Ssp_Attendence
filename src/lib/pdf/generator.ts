import "server-only";
import path from "node:path";
import { existsSync } from "node:fs";
import PDFDocument from "pdfkit";
import { getTranslations } from "next-intl/server";
import { formatLocalized } from "@/lib/utils/date";
import type { Locale } from "@/i18n/config";

export interface RequestPdfData {
  locale: Locale;
  request: {
    id: string;
    type: "leave" | "late";
    date: string;
    reason: string;
    created_at: string;
    hr_approved_at: string | null;
    section_head_approved_at: string | null;
  };
  employee: {
    full_name: string;
    email: string;
    role: string;
  };
  hrApprover: { full_name: string } | null;
  sectionHeadApprover: { full_name: string } | null;
  section: { name: string } | null;
  team: { name: string } | null;
}

// In serverless deployments (Vercel, etc.) `process.cwd()` is the function
// root and may not be the project root, so try several candidate locations
// before giving up. The `outputFileTracingIncludes` entry in next.config.ts
// guarantees the .otf files are shipped into the bundle, but the exact
// resolved path depends on the build output layout.
const FONT_CANDIDATE_DIRS = [
  path.join(process.cwd(), "src", "lib", "pdf", "fonts"),
  path.join(process.cwd(), ".next", "server", "src", "lib", "pdf", "fonts"),
  path.join(process.cwd(), ".next", "standalone", "src", "lib", "pdf", "fonts"),
];

interface ResolvedFonts {
  regular: string;
  bold: string;
}

let resolvedFonts: ResolvedFonts | null | undefined;

function resolveFonts(): ResolvedFonts | null {
  if (resolvedFonts !== undefined) return resolvedFonts;

  for (const dir of FONT_CANDIDATE_DIRS) {
    const regular = path.join(dir, "NotoSansJP-Regular.otf");
    const bold = path.join(dir, "NotoSansJP-Bold.otf");
    if (existsSync(regular) && existsSync(bold)) {
      resolvedFonts = { regular, bold };
      return resolvedFonts;
    }
  }

  console.warn(
    "[pdf.generator] Noto Sans JP fonts not found in any candidate path. " +
      "Falling back to Helvetica — Japanese characters will not render. " +
      `Tried: ${FONT_CANDIDATE_DIRS.join(", ")}`,
  );
  resolvedFonts = null;
  return null;
}

const FONT = {
  regular: "Body",
  bold: "BodyBold",
} as const;

/**
 * Build a clean approval PDF using pdfkit.
 * Returns a Buffer suitable for upload to Supabase Storage.
 */
export async function buildRequestPdf(data: RequestPdfData): Promise<Buffer> {
  const t = await getTranslations({
    locale: data.locale,
    namespace: "pdf",
  });
  const tRoles = await getTranslations({
    locale: data.locale,
    namespace: "roles",
  });

  const titleType =
    data.request.type === "leave" ? t("leaveType") : t("lateType");

  return await new Promise((resolve, reject) => {
    try {
      const fonts = resolveFonts();
      const doc = new PDFDocument({ size: "A4", margin: 56 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      if (fonts) {
        doc.registerFont(FONT.regular, fonts.regular);
        doc.registerFont(FONT.bold, fonts.bold);
      } else {
        // Helvetica is built-in; alias under our names so the body code
        // doesn't have to care which font is in use.
        doc.registerFont(FONT.regular, "Helvetica");
        doc.registerFont(FONT.bold, "Helvetica-Bold");
      }

      // Header
      doc
        .fillColor("#0f172a")
        .fontSize(22)
        .font(FONT.bold)
        .text(t("approvedTitle", { type: titleType }), { align: "left" });

      doc
        .moveDown(0.25)
        .fillColor("#475569")
        .fontSize(10)
        .font(FONT.regular)
        .text(t("requestId", { id: data.request.id }))
        .text(
          t("generated", {
            date: formatLocalized(new Date(), "mediumDate", data.locale),
          }),
        );

      doc.moveDown();
      doc
        .moveTo(56, doc.y)
        .lineTo(540, doc.y)
        .strokeColor("#cbd5e1")
        .lineWidth(1)
        .stroke();
      doc.moveDown();

      // Employee info
      sectionHeader(doc, t("section_employee"));
      kv(doc, t("label_name"), data.employee.full_name);
      kv(doc, t("label_email"), data.employee.email);
      kv(doc, t("label_role"), tRoles(data.employee.role));
      if (data.section) kv(doc, t("label_section"), data.section.name);
      if (data.team) kv(doc, t("label_team"), data.team.name);

      doc.moveDown();
      sectionHeader(doc, t("section_request"));
      kv(doc, t("label_type"), titleType);
      kv(
        doc,
        t("label_date"),
        formatLocalized(data.request.date, "mediumDate", data.locale),
      );
      kv(
        doc,
        t("label_submitted"),
        formatLocalized(data.request.created_at, "mediumDate", data.locale),
      );
      doc.moveDown(0.4);
      doc
        .fillColor("#0f172a")
        .font(FONT.bold)
        .fontSize(11)
        .text(t("label_reason"));
      doc
        .moveDown(0.2)
        .font(FONT.regular)
        .fontSize(11)
        .fillColor("#1e293b")
        .text(data.request.reason, { align: "left" });

      doc.moveDown();
      sectionHeader(doc, t("section_approvals"));
      kv(
        doc,
        t("label_hr_approval"),
        `${data.hrApprover?.full_name ?? "—"}` +
          (data.request.hr_approved_at
            ? `  ·  ${formatLocalized(data.request.hr_approved_at, "shortDateTime", data.locale)}`
            : ""),
      );
      kv(
        doc,
        t("label_section_head_approval"),
        `${data.sectionHeadApprover?.full_name ?? "—"}` +
          (data.request.section_head_approved_at
            ? `  ·  ${formatLocalized(data.request.section_head_approved_at, "shortDateTime", data.locale)}`
            : ""),
      );

      // Footer
      doc.moveDown(2);
      doc
        .fontSize(9)
        .fillColor("#94a3b8")
        .text(t("footer"), { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function sectionHeader(doc: PDFKit.PDFDocument, label: string) {
  doc
    .fillColor("#2563eb")
    .font(FONT.bold)
    .fontSize(13)
    .text(label.toUpperCase(), { characterSpacing: 1 });
  doc.moveDown(0.4);
}

function kv(doc: PDFKit.PDFDocument, key: string, value: string) {
  const startX = doc.x;
  doc
    .font(FONT.bold)
    .fontSize(11)
    .fillColor("#475569")
    .text(`${key}: `, { continued: true });
  doc
    .font(FONT.regular)
    .fillColor("#0f172a")
    .text(value);
  doc.x = startX;
  doc.moveDown(0.15);
}
