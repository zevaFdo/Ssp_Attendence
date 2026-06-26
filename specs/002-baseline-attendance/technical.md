# 勤怠・ステータスボード — 技術設計（ベースライン）
# Attendance & Status Board — Technical Design (Baseline)

> **Spec ID:** `specs/002-baseline-attendance/`
> **Status:** approved (baseline)

---

## データモデル | Data Model

**日本語:**

```sql
attendance (
  user_id, date, clock_in, clock_out, status, notes, recorded_by
  UNIQUE (user_id, date)
)
```

- ENUM `attendance_status` — `0001` + `0005_update_attendance_statuses.sql`
- インデックス: `idx_attendance_user_date`, `idx_attendance_date`

**English:** One row per user per day; status enum extended in migration 0005.

---

## Server Actions | Server Actions

| ファイル | 関数 | 説明 |
|----------|------|------|
| `src/actions/attendance.ts` | `setAttendanceStatus` | 日次ステートマシン（出退勤・中間ステータス） |
| `src/actions/attendance.ts` | `overrideAttendance` | チームリーダー上書き |

遅刻判定: 9:15 JST 以降の `present`/`wfh` は `late` に変換。

---

## UI ルート | UI Routes

| パス | コンポーネント |
|------|----------------|
| `/` | `StatusBoard`, `StatusBoardRealtime` |
| `/attendance` | `ClockInOutCard`, `StatusSwitcherGrid` |
| `/attendance/history` | `AttendanceHistoryFilters` |
| `/team` | `TeamMemberRow` |

Realtime: `src/hooks/useRealtimeStatus.ts` — Supabase Realtime on `attendance`.

---

## RLS | RLS

**日本語** (`0002_rls_policies.sql`):

- 従業員: 自分の `attendance` のみ SELECT/INSERT/UPDATE
- `admin`, `hr_supervisor`, `section_head`, `team_leader`: 全件 SELECT
- `team_leader`: 自チームメンバーのみ INSERT/UPDATE

**English:** Employees own rows; master roles read all; team leaders write team scope only.

---

## テスト方針 | Test Strategy

| 層 | 対象 |
|----|------|
| Unit | `setStatusSchema`, 日付ユーティリティ |
| Integration | `setAttendanceStatus` + RLS（実 DB） |
| E2E | 出退勤フロー、375px |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | Baseline adoption | 2026-06-26 | [x] |
