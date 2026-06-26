# 認証・セッション — 要件定義（ベースライン）
# Auth & Session — Requirements (Baseline)

> **Spec ID:** `specs/001-baseline-auth/`
> **Related Issue:** [#1](https://github.com/zevaFdo/Ssp_Attendence/issues/1) — 認証・セッション / Auth & session
> **Status:** approved (baseline)
> **Type:** 遡及ベースライン / Retroactive baseline — records **current** behavior

---

## 概要 | Overview

**日本語:** 招待制のメール/パスワード認証。Supabase Auth でサインインし、`profiles` とロールに基づきダッシュボードへルーティングする。未認証ユーザーはログインページへリダイレクト。

**English:** Invite-only email/password auth. Users sign in via Supabase Auth; the app routes to the dashboard based on `profiles` and role. Unauthenticated users are redirected to login.

---

## スコープ | Scope

### 含む / In scope

**日本語:**

- ログインページ (`/login`) — メール・パスワード
- サインアウト
- セッション維持（Supabase SSR cookies + middleware）
- ログイン後、`profiles.preferred_language` に基づくロケール Cookie 設定
- 言語切替（`ja` / `en`）— ログイン画面・ダッシュボード
- 招待のみ（自己登録 UI なし）

**English:**

- Login page, sign-out, session via Supabase SSR
- Locale cookie from `preferred_language` on login
- Language switcher (ja/en)
- Invite-only — no self-registration UI

### 含まない / Out of scope

**日本語:**

- パスワードリセット UI（Supabase ダッシュボード経由）
- SSO / OAuth
- 多要素認証

**English:** Password reset UI, SSO/OAuth, MFA.

---

## 受け入れ条件（現行）| Acceptance Criteria (current)

**日本語:**

1. 有効な認証情報でサインインするとダッシュボード（または `next` パラメータ先）へ遷移する
2. 無効な認証情報ではエラーメッセージを表示し、ページに留まる
3. 未認証で保護ルートにアクセスすると `/login` へリダイレクトされる
4. サインアウトでセッションが破棄され `/login` へ遷移する
5. UI 文言は `ja.json`（主）と `en.json`（副）で表示される

**English:** Valid login redirects; invalid shows error; protected routes require auth; sign-out clears session; bilingual UI strings.

---

## 憲法ギャップ | Constitution gaps

**日本語:** 本ドメインに憲法目標との差分なし。

**English:** No constitution target gaps in this domain.

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | Baseline adoption | 2026-06-26 | [x] |
