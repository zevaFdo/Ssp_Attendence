# 通知 — 技術設計（ベースライン）
# Notifications — Technical Design (Baseline)

> **Spec ID:** `specs/005-baseline-notifications/`
> **Status:** approved (baseline)

---

## データモデル | Data Model

```sql
notifications (
  user_id, title, message, is_read, related_request_id, created_at
)
```

インデックス: `idx_notifications_user_read`

---

## 挿入元 | Insert sources

| ソース | ファイル |
|--------|----------|
| DB triggers | `supabase/migrations/0003_workflow.sql` |
| （将来）アプリ層 | 未使用 / not used in baseline |

---

## Server Actions & UI

| パス | 説明 |
|------|------|
| `src/actions/notifications.ts` | `markRead`, `markAllRead` |
| `src/components/notifications/NotificationBell.tsx` | 未読バッジ |
| `src/components/notifications/NotificationsRealtime.tsx` | Realtime |
| `src/app/(dashboard)/layout.tsx` | 未読数カウント |

---

## RLS | RLS

- SELECT/UPDATE: `user_id = auth.uid()` のみ
- INSERT: トリガーは `security definer`

---

## テスト方針 | Test Strategy

| 層 | 対象 |
|----|------|
| Integration | トリガー通知 + RLS 既読 |
| E2E | 通知一覧・既読 |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | Baseline adoption | 2026-06-26 | [x] |
