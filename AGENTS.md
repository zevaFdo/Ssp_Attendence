# Attendance Web — Codex Agent Instructions
# Attendance Web — Codex エージェント指示書

> **Primary / 主言語:** 日本語 | **Secondary / 副言語:** English
> **Canonical rules / 正本:** `memory/constitution.md` (v1.1.0) — overrides all other guidance
> **Digest / 要約:** `docs/onboarding/01-constitution-essence.md`
> **Cursor parity / Cursor 同等:** `.cursorrules`

**日本語:** このファイルは OpenAI Codex（GitHub `@codex review` / CLI `/review`）向けのリポジトリ指示です。憲法違反は **P0 または P1** として報告してください。

**English:** Repository instructions for OpenAI Codex (GitHub `@codex review` / CLI `/review`). Report constitution violations as **P0 or P1**.

---

## 作業前 | Before Any Work

**日本語:** 実装・修正の前に `memory/constitution.md` を確認。違反の可能性がある場合は変更を提案せず、人間に確認を促す。

**English:** Read `memory/constitution.md` before implementing. If a violation is likely, stop and ask a human — do not patch around rules.

| Item | Value |
|------|-------|
| Stack | Next.js 15 (App Router), TypeScript, Supabase, Tailwind + Radix UI, Playwright |
| Locale | `ja-JP` primary UI; `en` via `next-intl`; timezone `Asia/Tokyo` |
| Server pattern | Server Actions directly (no separate service layer) |

---

## Review guidelines

Codex code review must enforce the Development Constitution. Flag only actionable issues; prefer P0/P1 for GitHub PR reviews.

### P0 — Block merge (security, data integrity, constitution breach)

- **RLS bypass:** Client-side use of `SUPABASE_SERVICE_ROLE_KEY`, missing RLS on new business tables, or policies that expose other users' data
- **Authz failure:** Routes or Server Actions callable without proper role checks (`admin`, `hr_supervisor`, `section_head`, `team_leader`, `employee`)
- **Forbidden renames** of env vars, tables, enums, roles, or storage paths (see list below)
- **XSS / injection:** Unsanitized user input rendered as HTML; raw SQL without parameterization
- **Secrets in client bundle:** Service role key, webhook URLs, or credentials in `NEXT_PUBLIC_*` or client components
- **Business rule regression** without a linked spec in `specs/[ID]-[name]/` (requirements + technical + implementation)
- **Approval workflow:** Removing or weakening `rejection_reason` requirement; breaking two-stage approval invariants

### P1 — Should fix before merge (quality, constitution compliance)

- **Test-first violation:** Implementation added with no corresponding test commit; tests written only after code to satisfy CI
- **Integration gap:** Server Action / API / RLS / migration change without integration test in `tests/integration/`
- **Schema incomplete:** Migration changed without updating `database.types.ts` and RLS policies together
- **Timeout increase:** Playwright, Vitest/Jest, or Server Action timeouts raised above fixed limits (15s test / 10s production)
- **Workaround code (Constitution VII):** Hardcoding, spec relaxation, or test-only branches to pass CI
- **i18n missing:** New UI strings in only `ja.json` or only `en.json` — both `src/messages/ja.json` and `en.json` required
- **Mobile-first (IX):** Touch targets under 44×44px; custom CSS outside `globals.css`; desktop-only layout without mobile/bottom nav consideration
- **Observability (V):** Server Actions / PDF / Teams webhook errors logged without request ID, user ID, or approval stage context
- **PII in logs:** Logging emails, names, or other personal data in structured logs

### P2/P3 — Note only if explicitly requested

- Style nits that do not affect meaning
- Documentation typos (unless PR comment asks to treat docs typos as P1)

### Security & Supabase (always scrutinize)

- Server Actions + RLS are the primary auth boundary — verify both layers
- `SUPABASE_SERVICE_ROLE_KEY` is server-only: invites, PDF upload, final approval
- New tables: RLS required; approval columns guarded by DB triggers
- Storage path convention: `request-documents/{user_id}/{request_id}.pdf`

### Forbidden renames — never approve

```
Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
     SUPABASE_SERVICE_ROLE_KEY, TEAMS_WEBHOOK_URL, APP_URL

Tables: profiles, sections, teams, attendance, requests, notifications

Enums: user_role, attendance_status, request_type, approval_status

Roles: admin, hr_supervisor, section_head, team_leader, employee

Storage: request-documents bucket
Path: request-documents/{user_id}/{request_id}.pdf
```

### Test expectations

- Unit: `tests/unit/` (UI mocks OK)
- Integration: `tests/integration/` with real Supabase/PostgreSQL
- E2E: `tests/e2e/` Playwright for approval flows, paid leave, cancel/edit
- UI changes: expect Playwright + manual 375px verification noted in PR

### Domain rules (flag incorrect behavior)

| Area | Rule |
|------|------|
| Request types | Leave, Late, Early leave, Out-of-office |
| Approval order (target) | Section Head → HR; rejection requires `rejection_reason` |
| Paid leave | Balance self-view; admin all-view; warn if fewer than 5 days taken, 2 months before year-end |
| Cancel/edit | Allowed before approval; restricted after full approval |

> **Migration note:** Current code may still use HR → Section Head. Do not flag as P0 if PR is unrelated; flag if PR accidentally cements wrong order without a migration spec.

### 10-dimension quality checklist

When reviewing, consider: error handling, performance (N+1, indexes), security, auth, reliability, maintainability, testability, scalability, observability, team conventions.

### PR must reference

- GitHub Issue (`closes #N`)
- Spec path under `specs/[ID]-[name]/`
- Constitution compliance checklist in PR body (see `.github/pull_request_template.md`)

---

## レビュー後 | After Review

**日本語:** P0/P1 がある場合は具体的なファイル・行を指摘。修正は `@codex fix the P1 issue` 等で依頼可能。マージ判断は人間が憲法チェックリストを確認して行う。

**English:** For P0/P1, cite file and line. Fixes can be requested via `@codex fix the P1 issue`. Human reviewer confirms constitution checklist before merge.
