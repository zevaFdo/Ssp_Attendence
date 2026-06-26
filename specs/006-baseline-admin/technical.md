# 管理・従業員招待 — 技術設計（ベースライン）
# Admin & Employee Invite — Technical Design (Baseline)

> **Spec ID:** `specs/006-baseline-admin/`
> **Status:** approved (baseline)

---

## データモデル | Data Model

| テーブル | 用途 |
|----------|------|
| `sections` | 部署、`section_head_id` |
| `teams` | チーム、`section_id`, `team_leader_id` |
| `profiles` | ユーザー、`role`, `section_id`, `team_id`, `is_active` |

---

## Server Actions | Server Actions

| ファイル | 関数 |
|----------|------|
| `src/actions/employees.ts` | `inviteEmployee`, `updateEmployee` |
| `src/actions/sections.ts` | セクション CRUD |
| `src/actions/teams.ts` | チーム CRUD |
| `src/lib/auth/permissions.ts` | `canRegisterEmployees`, `isAdmin` |

Service Role: `src/lib/supabase/admin.ts` — 招待メール送信のみサーバー。

---

## RLS & トリガー | RLS & Triggers

- `tg_profiles_lock_fields` — 非 admin の `role`/`section_id`/`team_id` 変更禁止
- セクション/チーム: admin のみ書込（`0002_rls_policies.sql`）

---

## UI コンポーネント | UI Components

- `src/components/admin/SectionForm.tsx`, `TeamForm.tsx`, `UserRow.tsx`
- `src/components/employees/InviteEmployeeForm.tsx`, `EmployeeTable.tsx`
- `src/components/layout/RoleGuard.tsx`

---

## テスト方針 | Test Strategy

| 層 | 対象 |
|----|------|
| Integration | `inviteEmployee` + RLS + トリガー |
| E2E | 招待フロー（admin） |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | Baseline adoption | 2026-06-26 | [x] |
