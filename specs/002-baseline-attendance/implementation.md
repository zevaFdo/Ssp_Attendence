# 勤怠・ステータスボード — 実装計画（ベースライン）
# Attendance & Status Board — Implementation Plan (Baseline)

> **Spec ID:** `specs/002-baseline-attendance/`
> **Status:** approved (baseline) — **already implemented**

---

## 遡及記録 | Retroactive note

**日本語:** 憲法採用前実装のベースライン記録。有給連動は別 Issue。

**English:** Baseline record; paid-leave integration is a separate Issue.

---

## 主要ファイル | Key files

- `src/actions/attendance.ts`
- `src/lib/validations/attendance.ts`
- `src/components/attendance/*`
- `src/components/dashboard/StatusBoard*.tsx`
- `supabase/migrations/0001_init_schema.sql`, `0005_update_attendance_statuses.sql`

---

## 完了定義 | Definition of Done

- [x] 3 段階仕様書
- [x] GitHub Issue リンク — [#2](https://github.com/zevaFdo/Ssp_Attendence/issues/2)
- [x] GitHub Issue 承認・クローズ（チェックリスト完了）
- [ ] 統合/E2E テスト追加（今後の変更時に test-first）

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| implementation | Baseline adoption | 2026-06-26 | [x] |
