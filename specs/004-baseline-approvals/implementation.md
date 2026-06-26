# 承認・PDF・Teams — 実装計画（ベースライン）
# Approvals, PDF & Teams — Implementation Plan (Baseline)

> **Spec ID:** `specs/004-baseline-approvals/`
> **Status:** approved (baseline) — **already implemented**

---

## 主要ファイル | Key files

- `src/actions/approvals.ts`
- `src/components/requests/ApprovalActions.tsx`
- `src/lib/pdf/generator.ts`, `upload.ts`
- `src/lib/teams/webhook.ts`
- `supabase/migrations/0003_workflow.sql`

---

## 移行 Issue | Migration Issue

承認順序の憲法準拠は **単独の高リスク変更** — 以下を同時更新:

- DB カラム意味 / トリガー順序
- Server Actions 承認順
- UI ラベル・i18n
- 統合 + E2E テスト

---

## 完了定義 | Definition of Done

- [x] 3 段階仕様書
- [x] GitHub Issue リンク — [#4](https://github.com/zevaFdo/Ssp_Attendence/issues/4)

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| implementation | Baseline adoption | 2026-06-26 | [x] |
