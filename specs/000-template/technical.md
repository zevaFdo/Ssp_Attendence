# [機能名] — 技術設計 | [Feature Name] — Technical Design

> **Spec ID:** `specs/XXX-feature-name/`
> **Prerequisite:** `requirements.md` approved
> **Status:** draft | approved

---

## アーキテクチャ概要 | Architecture Overview

**日本語:** （影響するレイヤー: UI / Server Actions / DB / Storage など）

**English:** (Affected layers: UI, Server Actions, DB, Storage, etc.)

---

## データモデル | Data Model

**日本語:**

- テーブル / カラム変更: yes / no
- マイグレーション: `supabase/migrations/00NN_*.sql`
- RLS ポリシー変更: （記述）

**English:**

- Table/column changes: yes / no
- Migration file(s)
- RLS policy changes

---

## API・Server Actions | API & Server Actions

**日本語:**

| パス / Path | 種別 / Type | 説明 / Description |
|-------------|-------------|-------------------|
| `src/actions/...` | Server Action | |

**English:** (Same table.)

---

## セキュリティ | Security

**日本語:**

- RLS: （ポリシー概要）
- Service Role 使用: yes / no（サーバー専用 / server-only）
- 認可ロール: （`section_head`, `hr_supervisor` など）

**English:** (RLS, service role usage, authorized roles.)

---

## i18n

**日本語:** 追加キー — `src/messages/ja.json` + `en.json`

**English:** New keys in both `ja.json` and `en.json`.

---

## テスト方針 | Test Strategy

**日本語:**

| 層 / Layer | 対象 / Target | ファイル / File |
|----------|---------------|-----------------|
| Unit | | `tests/unit/` |
| Integration | | `tests/integration/` |
| E2E | | `tests/e2e/` |

**English:** (Same table.)

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | | | [ ] |
