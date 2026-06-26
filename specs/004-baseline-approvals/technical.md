# 承認・PDF・Teams — 技術設計（ベースライン）
# Approvals, PDF & Teams — Technical Design (Baseline)

> **Spec ID:** `specs/004-baseline-approvals/`
> **Status:** approved (baseline)

---

## Server Actions | Server Actions

| 関数 | ファイル | 説明 |
|------|----------|------|
| `hrDecide` | `src/actions/approvals.ts` | `hr_approval` 更新 |
| `sectionHeadDecide` | `src/actions/approvals.ts` | `section_head_approval` 更新 + PDF |
| `finalizeRequestPdf` | `src/actions/approvals.ts` | 冪等 PDF 生成（admin client） |
| `regeneratePdf` | `src/actions/approvals.ts` | 手動再生成 |

---

## PDF & Storage

| 項目 | 値 |
|------|-----|
| 生成 | `src/lib/pdf/generator.ts` — pdfkit + NotoSansJP |
| アップロード | `src/lib/pdf/upload.ts` — Service Role |
| パス | `request-documents/{user_id}/{request_id}.pdf` |
| ダウンロード | `src/app/api/requests/[id]/pdf/route.ts` |

---

## DB トリガー | DB Triggers (`0003_workflow.sql`)

| トリガー | イベント | 動作 |
|----------|----------|------|
| `trg_request_notify_hr` | INSERT requests | 全 HR に通知 |
| `trg_request_notify_section_head` | UPDATE hr_approval | SH / フォールバック + 申請者 |
| `trg_request_notify_employee_sh` | UPDATE section_head_approval | 申請者に最終結果通知 |

---

## セキュリティ | Security

- Service Role: PDF アップロード、`finalizeRequestPdf` のみサーバー
- RLS カラムガード: `tg_requests_column_guard` — ロール別 UPDATE 制限
- `document_path` は admin client で更新（HR/SH の直接 UPDATE 不可）

---

## テスト方針 | Test Strategy

| 層 | 対象 |
|----|------|
| Integration | `hrDecide`, `sectionHeadDecide`, RLS, トリガー |
| E2E | 承認フロー end-to-end |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | Baseline adoption | 2026-06-26 | [x] |
