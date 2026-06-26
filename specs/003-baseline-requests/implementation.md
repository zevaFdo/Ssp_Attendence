# 申請（休暇・遅刻）— 実装計画（ベースライン）
# Requests (Leave & Late) — Implementation Plan (Baseline)

> **Spec ID:** `specs/003-baseline-requests/`
> **Status:** approved (baseline) — **already implemented**

---

## 主要ファイル | Key files

- `src/actions/requests.ts`
- `src/app/(dashboard)/requests/**`
- `src/components/requests/RequestForm.tsx`
- `supabase/migrations/0001_init_schema.sql`, `0003_workflow.sql`

---

## 移行 Issue（別 spec）| Migration Issues (separate specs)

憲法ギャップ解消は **個別 Issue** で実施:

- 申請種別拡張（早退・外出）
- 日付/時刻フィールド拡張
- 処理方法（有給）
- 取消・編集

---

## 完了定義 | Definition of Done

- [x] 3 段階仕様書
- [x] GitHub Issue リンク — [#3](https://github.com/zevaFdo/Ssp_Attendence/issues/3)
- [x] GitHub Issue 承認・クローズ（チェックリスト完了）

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| implementation | Baseline adoption | 2026-06-26 | [x] |
