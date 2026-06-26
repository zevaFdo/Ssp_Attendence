# [機能名] — 実装計画 | [Feature Name] — Implementation Plan

> **Spec ID:** `specs/XXX-feature-name/`
> **Prerequisite:** `technical.md` approved
> **Status:** draft | approved

---

## ブランチ | Branch

**日本語:** `feature/issue-N-short-name`

**English:** `feature/issue-N-short-name`

---

## 実装順序（テストファースト）| Implementation Order (Test-First)

**日本語:** 憲法 II に従い、以下の順序を厳守する。

1. テスト作成 → commit (`test: ... (RED)`)
2. テスト実行 → 失敗確認
3. 最小実装 → commit (`feat/fix: ... (GREEN)`)
4. 全テスト PASS 確認
5. リファクタ → commit (`refactor: ...`)

**English:** Follow Constitution II strictly: RED commit → confirm fail → GREEN → refactor.

---

## タスク一覧 | Task Checklist

**日本語:**

- [ ] 単体テスト（`tests/unit/`）
- [ ] 統合テスト（`tests/integration/`）— 実 Supabase
- [ ] E2E テスト（`tests/e2e/`）— Playwright
- [ ] UI 実装 + i18n（`ja.json` / `en.json`）
- [ ] ブラウザ手動確認（375px 含む）
- [ ] PR 作成（テンプレート記入）

**English:** (Same checklist.)

---

## リスク・依存 | Risks & Dependencies

**日本語:**

| リスク / Risk | 対策 / Mitigation |
|---------------|-------------------|
| | |

**English:** (Same table.)

---

## 完了定義 | Definition of Done

**日本語:**

- [ ] 受け入れ条件をすべて満たす
- [ ] 憲法準拠チェックリスト（PR テンプレート）完了
- [ ] Issue をクローズ

**English:** All acceptance criteria met; constitution checklist complete; Issue closed.

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| implementation | | | [ ] |
