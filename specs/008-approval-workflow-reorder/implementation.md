# 承認ワークフロー改正 — 実装計画
# Approval Workflow Reorder — Implementation Plan

> **Spec ID:** `specs/008-approval-workflow-reorder/`
> **Prerequisite:** `technical.md` approved (2026-07-06)
> **Related Issue:** [#8](https://github.com/zevaFdo/Ssp_Attendence/issues/8)
> **Status:** approved — **実装進行中 / in progress**

---

## ブランチ | Branch

**日本語:** `feature/issue-8-approval-workflow-reorder`（`feature/issue-7-constitution-v6` から分岐可）

**English:** `feature/issue-8-approval-workflow-reorder` (may branch from issue-7 docs branch)

---

## 実装順序（テストファースト）| Implementation Order (Test-First)

1. `test: 承認ワークフロー改正の単体・統合テスト (RED)` — commit
2. `npm run test` → 失敗確認
3. `0004_approval_workflow_reorder.sql` + Server Actions + UI + i18n → `feat: 承認順序 Section Head → HR (GREEN)` — commit
4. E2E 追加 → 全 PASS
5. 必要なら `refactor:` commit

---

## タスク一覧 | Task Checklist

- [ ] 単体: `tests/unit/validations/approval-decision.test.ts`
- [ ] 統合: `tests/integration/approval-workflow.test.ts`（実 Supabase）
- [ ] マイグレーション: `supabase/migrations/0004_approval_workflow_reorder.sql`
- [ ] 型: `database.types.ts`, `app.ts`
- [ ] バリデーション: `approvalDecisionSchema`
- [ ] Server Actions: `approvals.ts`
- [ ] UI: `ApprovalActions`, `/approvals`, `/requests/[id]`
- [ ] i18n: `ja.json`, `en.json`
- [ ] E2E: `tests/e2e/approval-workflow.spec.ts`
- [ ] ブラウザ手動確認（375px）
- [ ] PR（`closes #8`）

---

## リスク・依存 | Risks & Dependencies

| リスク / Risk | 対策 / Mitigation |
|---------------|-------------------|
| 進行中申請の移行 | `0004` 内 SQL + 統合テストで検証 |
| PDF タイミング変更 | `hrDecide` のみ `finalizeRequestPdf` |
| CI に実 Supabase なし | `hasSupabaseTestEnv()` でスキップ（既存パターン） |

---

## 完了定義 | Definition of Done

- [ ] `requirements.md` 受け入れ条件すべて PASS
- [ ] 統合 + E2E + 単体テスト PASS
- [ ] 憲法 PR チェックリスト完了
- [ ] Issue #8 クローズ

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| implementation | プロジェクトオーナー | 2026-07-06 | [x] |
