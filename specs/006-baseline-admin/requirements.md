# 管理・従業員招待 — 要件定義（ベースライン）
# Admin & Employee Invite — Requirements (Baseline)

> **Spec ID:** `specs/006-baseline-admin/`
> **Related Issue:** [#6](https://github.com/zevaFdo/Ssp_Attendence/issues/6) — 管理・従業員招待 / Admin
> **Status:** approved (baseline)

---

## 概要 | Overview

**日本語:** 組織構造（部署・チーム）とユーザー管理。管理者は全権限；HR・所属上長は従業員招待可能（ロール昇格は admin のみ）。

**English:** Org structure (sections, teams) and user management. Admin has full access; HR and section heads can invite employees (role promotion admin-only).

---

## スコープ | Scope

### 含む / In scope

| 機能 | パス | ロール |
|------|------|--------|
| ユーザー管理 | `/admin/users` | `admin` |
| 部署管理 | `/admin/sections` | `admin` |
| チーム管理 | `/admin/teams` | `admin` |
| 従業員一覧 | `/employees` | `admin`, `hr_supervisor`, `section_head` |
| 従業員招待 | `InviteEmployeeForm` | `admin`, `hr_supervisor`, `section_head` |

招待: Supabase Auth `inviteUserByEmail`（Service Role）+ `profiles` 行作成。

### 含まない / Out of scope

- 有給一覧・付与（憲法 XII — 未実装）
- 自己登録

---

## 受け入れ条件（現行）| Acceptance Criteria (current)

1. Admin がセクション/チーム CRUD できる
2. Admin がユーザーロール・所属を変更できる
3. HR/SH/admin がメール招待で新規従業員を登録できる
4. 非 admin の招待者は `employee` ロールのみ付与可能
5. `profiles` の `role`/`section_id`/`team_id` は DB トリガーで保護

---

## 憲法ギャップ | Constitution gaps

| 領域 | ベースライン | 憲法目標 |
|------|-------------|----------|
| 有給 admin 一覧 | 未実装 | admin 全員確認 |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | Baseline adoption | 2026-06-26 | [x] |
