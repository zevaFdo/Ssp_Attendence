# 認証・セッション — 実装計画（ベースライン）
# Auth & Session — Implementation Plan (Baseline)

> **Spec ID:** `specs/001-baseline-auth/`
> **Prerequisite:** `technical.md` approved (baseline)
> **Status:** approved (baseline) — **already implemented**

---

## 遡及記録 | Retroactive note

**日本語:** 本機能は憲法採用前に実装済み。本書は現行コードのベースライン記録であり、新規実装タスクではない。今後の変更は通常の spec-first + test-first フローに従う。

**English:** Pre-constitution implementation. This document records the baseline; future changes require normal spec-first workflow.

---

## 主要ファイル | Key files

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/LoginForm.tsx`
- `src/actions/auth.ts`
- `src/lib/auth/session.ts`
- `src/middleware.ts`

---

## 完了定義（ベースライン）| Definition of Done (baseline)

- [x] 要件・技術・実装の 3 段階文書化
- [x] 現行挙動とコードの対応確認
- [x] GitHub Issue 起票・番号リンク — [#1](https://github.com/zevaFdo/Ssp_Attendence/issues/1)
- [x] GitHub Issue 承認・クローズ（チェックリスト完了）

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| implementation | Baseline adoption | 2026-06-26 | [x] |
