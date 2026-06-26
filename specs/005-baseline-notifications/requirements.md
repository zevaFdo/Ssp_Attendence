# 通知 — 要件定義（ベースライン）
# Notifications — Requirements (Baseline)

> **Spec ID:** `specs/005-baseline-notifications/`
> **Related Issue:** [#5](https://github.com/zevaFdo/Ssp_Attendence/issues/5) — アプリ内通知 / Notifications
> **Status:** approved (baseline)

---

## 概要 | Overview

**日本語:** 申請ライフサイクルに連動するアプリ内通知。DB トリガーで挿入、Realtime で UI 更新。受信者のみ閲覧・既読化可能。

**English:** In-app notifications tied to request lifecycle. Inserted by DB triggers; UI updates via Realtime. Recipients only can read and mark read.

---

## スコープ | Scope

### 含む / In scope

- 通知一覧 (`/notifications`)
- トップバー未読バッジ（`NotificationBell`）
- 個別既読 (`markRead`) / 一括既読 (`markAllRead`)
- Realtime 購読 (`NotificationsRealtime`)
- 申請関連通知（新規・HR 結果・SH 結果・最終承認）

### 含まない / Out of scope

- メール通知
- 通知文言の i18n（DB トリガーは英語固定）
- 有給警告通知（未実装）

---

## 受け入れ条件（現行）| Acceptance Criteria (current)

1. 申請作成で HR ユーザーに通知が届く
2. 承認/却下の各段階で関係者に通知
3. ユーザーは自分の通知のみ表示・既読化できる
4. 未読数がトップバーに反映される
5. Realtime で新着が UI に反映される

---

## 憲法ギャップ | Constitution gaps

通知配信自体にギャップなし。文言 i18n は将来改善。

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | Baseline adoption | 2026-06-26 | [x] |
