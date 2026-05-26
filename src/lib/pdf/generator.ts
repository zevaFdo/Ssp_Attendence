import "server-only";
import PDFDocument from "pdfkit";
import { formatDateTime } from "@/lib/utils/date";

export interface RequestPdfData {
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

/**
 * Build a clean approval PDF using pdfkit.
 * Returns a Buffer suitable for upload to Supabase Storage.
 */
export async function buildRequestPdf(data: RequestPdfData): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 56 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk as Buffer));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const titleType =
        data.request.type === "leave" ? "Leave Request" : "Late Arrival";

      // Header
      doc
        .fillColor("#0f172a")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(`Approved ${titleType}`, { align: "left" });

      doc
        .moveDown(0.25)
        .fillColor("#475569")
        .fontSize(10)
        .font("Helvetica")
        .text(`Request ID: ${data.request.id}`)
        .text(`Generated: ${formatDateTime(new Date())}`);

      doc.moveDown();
      doc
        .moveTo(56, doc.y)
        .lineTo(540, doc.y)
        .strokeColor("#cbd5e1")
        .lineWidth(1)
        .stroke();
      doc.moveDown();

      // Employee info
      sectionHeader(doc, "Employee");
      kv(doc, "Name", data.employee.full_name);
      kv(doc, "Email", data.employee.email);
      kv(doc, "Role", data.employee.role);
      if (data.section) kv(doc, "Section", data.section.name);
      if (data.team) kv(doc, "Team", data.team.name);

      doc.moveDown();
      sectionHeader(doc, "Request");
      kv(doc, "Type", titleType);
      kv(doc, "Date", data.request.date);
      kv(doc, "Submitted", formatDateTime(data.request.created_at));
      doc.moveDown(0.4);
      doc
        .fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Reason");
      doc
        .moveDown(0.2)
        .font("Helvetica")
        .fontSize(11)
        .fillColor("#1e293b")
        .text(data.request.reason, { align: "left" });

      doc.moveDown();
      sectionHeader(doc, "Approvals");
      kv(
        doc,
        "HR Approval",
        `${data.hrApprover?.full_name ?? "—"}` +
          (data.request.hr_approved_at
            ? `  ·  ${formatDateTime(data.request.hr_approved_at)}`
            : ""),
      );
      kv(
        doc,
        "Section Head Approval",
        `${data.sectionHeadApprover?.full_name ?? "—"}` +
          (data.request.section_head_approved_at
            ? `  ·  ${formatDateTime(data.request.section_head_approved_at)}`
            : ""),
      );

      // Footer
      doc.moveDown(2);
      doc
        .fontSize(9)
        .fillColor("#94a3b8")
        .text(
          "This document was generated automatically by the Attendance Web system.",
          { align: "center" },
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function sectionHeader(doc: PDFKit.PDFDocument, label: string) {
  doc
    .fillColor("#2563eb")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(label.toUpperCase(), { characterSpacing: 1 });
  doc.moveDown(0.4);
}

function kv(doc: PDFKit.PDFDocument, key: string, value: string) {
  const startX = doc.x;
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#475569")
    .text(`${key}: `, { continued: true });
  doc
    .font("Helvetica")
    .fillColor("#0f172a")
    .text(value);
  doc.x = startX;
  doc.moveDown(0.15);
}
