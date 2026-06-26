# 勤怠・ステータスボード — 要件定義（ベースライン）
# Attendance & Status Board — Requirements (Baseline)

> **Spec ID:** `specs/002-baseline-attendance/`
> **Related Issue:** [#2](https://github.com/zevaFdo/Ssp_Attendence/issues/2) — 勤怠・ステータスボード / Attendance
> **Status:** approved (baseline)

---

## 概要 | Overview

**日本語:** 従業員の日次勤怠（出退勤・ステータス）を記録し、全社ステータスボードでリアルタイム表示する。チームリーダーは自チームメンバーの勤怠を上書き可能。ロールに応じた履歴閲覧。

**English:** Records daily attendance (clock in/out, status), shows company-wide realtime status board. Team leaders can override team members' attendance. Role-based history viewing.

---

## スコープ | Scope

### 含む / In scope

**日本語:**

- **出退勤** (`/attendance`) — マルチステータススイッチャー、WFH、遅刻自動判定（9:15 以降）
- **ステータスボード** (`/`) — 当日全従業員グリッド、Realtime 更新
- **勤怠履歴** (`/attendance/history`) — 日付フィルタ・名前検索；従業員は自分のみ、マスターロールは全員
- **チーム** (`/team`) — チームリーダーが当日メンバーステータス確認・上書き
- ステータス値: `present`, `late`, `absent`, `wfh`, `on_leave`, `meeting`, `break`, `out_of_office`, `clocked_out`（`0005` マイグレーション）

**English:** Clock in/out, status board with realtime, history with role filters, team leader override, extended status enum.

### 含まない / Out of scope

**日本語:** 有給残日数、申請連動の自動 `on_leave`（申請承認との連携は未実装）

**English:** Paid leave balance; automatic `on_leave` from approved requests.

---

## 受け入れ条件（現行）| Acceptance Criteria (current)

**日本語:**

1. 従業員が当日ステータスを選択すると `attendance` 行が作成/更新される
2. 初回 `present`/`wfh`/`late` で `clock_in` が記録される
3. `clocked_out` で `clock_out` が記録され、当日はそれ以上変更不可
4. ステータスボードに全アクティブ従業員が表示され、未打刻は `absent`
5. チームリーダーは自チームメンバーのみ `overrideAttendance` 可能
6. モバイル（375px）で出退勤 UI が操作可能

**English:** Status changes persist; clock_in/out rules enforced; board shows all employees; team leader scope limited; mobile usable.

---

## 憲法ギャップ | Constitution gaps

| 領域 | ベースライン | 憲法目標 |
|------|-------------|----------|
| 有給 | 未実装 | 残日数・5日警告・admin 一覧 |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | Baseline adoption | 2026-06-26 | [x] |
