# 申請（休暇・遅刻）— 要件定義（ベースライン）
# Requests (Leave & Late) — Requirements (Baseline)

> **Spec ID:** `specs/003-baseline-requests/`
> **Related Issue:** [#3](https://github.com/zevaFdo/Ssp_Attendence/issues/3) — 休暇・遅刻申請 / Requests
> **Status:** approved (baseline)

---

## 概要 | Overview

**日本語:** 従業員が休暇（`leave`）または遅刻（`late`）申請を提出する。単一日付・理由（5文字以上）必須。一覧・詳細表示。承認フローは [`004-baseline-approvals`](../004-baseline-approvals/)。

**English:** Employees submit leave or late requests with single date and reason (min 5 chars). List and detail views. Approval flow documented in spec 004.

---

## スコープ | Scope

### 含む / In scope

**日本語:**

- 新規申請 (`/requests/new`) — 種別 `leave` | `late`、日付、理由
- 申請一覧 (`/requests`) — 自分の申請；マスターロールは全件
- 申請詳細 (`/requests/[id]`) — 承認状態、PDF リンク（承認完了後）
- 申請作成時に MS Teams Adaptive Card 送信（任意、`TEAMS_WEBHOOK_URL`）

**English:** Create, list, detail; Teams webhook on create (optional).

### 含まない / Out of scope

**日本語:** 早退・外出、日付範囲、半休、処理方法（有給/時間変更）、取消・編集、却下理由入力

**English:** Early leave, out-of-office, date ranges, half-day, processing method, cancel/edit, rejection reason.

---

## 受け入れ条件（現行）| Acceptance Criteria (current)

1. 認証済み従業員が `leave` または `late` を提出できる
2. 理由は 5〜1000 文字（Zod `requestCreateSchema`）
3. 日付は `YYYY-MM-DD` 形式
4. 作成後、詳細ページへリダイレクト
5. DB トリガーで HR ユーザーに通知（`0003_workflow.sql`）

---

## 憲法ギャップ | Constitution gaps

| 領域 | ベースライン | 憲法目標 |
|------|-------------|----------|
| 申請種別 | `leave`, `late` | 4 種別 |
| 日付 | 単一 `date` | 期間・半休・時刻 From–To |
| 処理方法 | なし | 有給 / 時間変更 |
| 取消・変更 | なし | 承認前可 |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | Baseline adoption | 2026-06-26 | [x] |
