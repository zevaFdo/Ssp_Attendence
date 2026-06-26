# 申請（休暇・遅刻）— 技術設計（ベースライン）
# Requests (Leave & Late) — Technical Design (Baseline)

> **Spec ID:** `specs/003-baseline-requests/`
> **Status:** approved (baseline)

---

## データモデル | Data Model

```sql
requests (
  user_id, type, date, reason,
  hr_approval, hr_approved_by, hr_approved_at,
  section_head_approval, section_head_approved_by, section_head_approved_at,
  document_path
)
```

- ENUM `request_type`: `leave`, `late`
- ENUM `approval_status`: `pending`, `approved`, `rejected`

---

## Server Actions & API

| パス | 説明 |
|------|------|
| `src/actions/requests.ts` → `createRequest` | INSERT + Teams webhook |
| `src/lib/validations/requests.ts` | `requestCreateSchema` |
| `src/lib/teams/webhook.ts` | Adaptive Card |
| `src/components/requests/RequestForm.tsx` | フォーム UI |

---

## RLS | RLS

- 従業員: 自分の `requests` の SELECT/INSERT
- HR: `hr_*` カラムのみ UPDATE（`tg_requests_column_guard`）
- Section Head: `section_head_*` カラムのみ UPDATE

---

## テスト方針 | Test Strategy

| 層 | 対象 |
|----|------|
| Unit | `requestCreateSchema` |
| Integration | `createRequest` + RLS + トリガー通知 |
| E2E | 申請提出フロー |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | Baseline adoption | 2026-06-26 | [x] |
