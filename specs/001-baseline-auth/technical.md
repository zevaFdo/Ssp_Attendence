# 認証・セッション — 技術設計（ベースライン）
# Auth & Session — Technical Design (Baseline)

> **Spec ID:** `specs/001-baseline-auth/`
> **Prerequisite:** `requirements.md` approved (baseline)
> **Status:** approved (baseline)

---

## アーキテクチャ概要 | Architecture Overview

**日本語:**

| レイヤー | 実装 |
|----------|------|
| UI | `src/app/(auth)/login/`, `LoginForm.tsx`, `LanguageSwitcher` |
| Server Actions | `src/actions/auth.ts` — `signIn`, `signOut` |
| Session | `src/lib/auth/session.ts` — `getCurrentProfile` |
| Middleware | `src/middleware.ts`, `src/lib/supabase/middleware.ts` |
| i18n | `next-intl`, `src/i18n/`, `src/messages/ja.json` + `en.json` |

**English:** Same layers — auth route group, server actions, session helper, middleware, next-intl.

---

## データモデル | Data Model

**日本語:**

- `auth.users` — Supabase Auth（メール/パスワード）
- `profiles` — `id` = `auth.users.id`, `role`, `preferred_language`, `is_active`
- マイグレーション: `0001_init_schema.sql`, `0004_preferred_language.sql`
- RLS: `0002_rls_policies.sql` — 認証済みユーザーが `profiles` を読取可能

**English:** Supabase Auth + `profiles` 1:1; RLS on profiles.

---

## Server Actions | Server Actions

| パス | 説明 |
|------|------|
| `signIn(formData)` | `signInWithPassword` → locale cookie → `redirect(next)` |
| `signOut()` | `auth.signOut()` → `redirect(/login)` |

---

## セキュリティ | Security

**日本語:**

- クライアントに Service Role Key を露出しない
- パスワードは Supabase Auth が管理
- 非アクティブユーザー (`is_active = false`) の扱いはプロファイル参照時にアプリ層で制御

**English:** No service role on client; passwords managed by Supabase Auth.

---

## テスト方針 | Test Strategy

| 層 | 対象 | ファイル |
|----|------|----------|
| E2E | ログインフォーム表示 | `tests/e2e/login.spec.ts` |
| Integration | セッション + RLS | 将来追加 / future |
| Unit | バリデーション | 将来追加 / future |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | Baseline adoption | 2026-06-26 | [x] |
