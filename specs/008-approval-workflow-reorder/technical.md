# 承認ワークフロー改正 — 技術設計
# Approval Workflow Reorder — Technical Design

> **Spec ID:** `specs/008-approval-workflow-reorder/`
> **Prerequisite:** `requirements.md` approved (2026-07-06)
> **Related Issue:** [#8](https://github.com/zevaFdo/Ssp_Attendence/issues/8)
> **Status:** approved
> **Approved by:** プロジェクトオーナー — 2026-07-06
> **Baseline:** `specs/004-baseline-approvals/`

---

## アーキテクチャ概要 | Architecture Overview

**日本語:** カラム名 `section_head_approval`（第1段階）・`hr_approval`（第2段階）は**変更しない**（禁止リネーム回避・既存 RLS/型の再利用）。現行は**意味が逆**（HR が先に更新）のため、トリガー・Server Actions・UI クエリ・PDF タイミングを一括で正す。新マイグレーション `0006_approval_workflow_reorder.sql` でスキーマ・トリガー・進行中データ移行を行う。

**English:** Keep column names `section_head_approval` (stage 1) and `hr_approval` (stage 2) — no renames. Today semantics are inverted (HR acts first). Fix triggers, Server Actions, UI queries, and PDF timing together. New migration `0006_approval_workflow_reorder.sql` handles schema, triggers, and in-flight data.

### 影響レイヤー | Affected layers

| レイヤー / Layer | 変更 / Change |
|------------------|---------------|
| DB migration | `rejection_reason`、トリガー置換、CHECK、進行中移行 |
| RLS / column guard | `rejection_reason` ガード追加 |
| Server Actions | 却下理由、PDF を `hrDecide` へ移動、stage 前提チェック |
| UI | キュー順序、却下ダイアログ、詳細ページの canApprove 条件 |
| i18n | 却下理由ラベル、通知文言の段階名 |
| Types | `database.types.ts` 手動追記（`rejection_reason`） |
| Tests | 統合（実 Supabase）+ E2E Playwright |

---

## 段階セマンティクス | Stage Semantics

| カラム / Column | 段階 / Stage | 承認者 / Approver | 順序 / Order |
|-----------------|--------------|-------------------|--------------|
| `section_head_approval` | 第1 | 全 active `section_head`（いずれか一方で可） | 先 / First |
| `hr_approval` | 第2 | `hr_supervisor`（+ `admin`） | 後 / Second |

**承認可能条件 / Who can act when:**

| ロール / Role | 条件 / Condition |
|---------------|------------------|
| `section_head`, `admin` | `section_head_approval = pending` かつ 他方が rejected でない |
| `hr_supervisor`, `admin` | `section_head_approval = approved` かつ `hr_approval = pending` |

`hr_supervisor` が `section_head` ロールを兼ねる場合は第1段階も可（既存 `canApproveAsSectionHead`）。

---

## データモデル | Data Model

### スキーマ変更 | Schema changes

**マイグレーション:** `supabase/migrations/0006_approval_workflow_reorder.sql`

```sql
-- rejection_reason（却下時必須）
alter table public.requests
  add column if not exists rejection_reason text;

-- 却下時は 5 文字以上（申請 reason と同等）
alter table public.requests
  add constraint requests_rejection_reason_check
  check (
    (hr_approval <> 'rejected' and section_head_approval <> 'rejected')
    or (
      rejection_reason is not null
      and length(trim(rejection_reason)) >= 5
    )
  );
```

| カラム / Column | 型 / Type | 説明 / Description |
|-----------------|-----------|-------------------|
| `rejection_reason` | `text` nullable | いずれかの段階で `rejected` のとき必須（≥5文字） |

**インデックス変更 / Index changes:**

```sql
-- 第1待ち: section_head pending（全体）
-- 既存 idx_requests_sh_pending はそのまま利用可

-- 第2待ち: SH approved + HR pending
create index if not exists idx_requests_hr_stage2_pending
  on public.requests (hr_approval)
  where section_head_approval = 'approved' and hr_approval = 'pending';
```

既存 `idx_requests_hr_pending`（`hr_approval = pending` のみ）は**第1待ちと混同**するため削除し、上記に置換。

### 進行中申請の移行 | In-flight migration

**方針 / Policy:** 本番適用前に `SELECT` で件数確認。移行は単一トランザクション。

| 現行状態 / Current state | 件数確認クエリ | 移行アクション / Action |
|--------------------------|----------------|-------------------------|
| `sh=approved`, `hr=approved` | 完了済み | **変更なし** |
| `sh=pending`, `hr=pending` | 未着手 | **変更なし**（新フロー適用） |
| `hr=approved`, `sh=pending` | OLD 第1完了・第2待ち | **リセット:** `hr_approval=pending`, `hr_approved_by/at=null` — SH から再開。全 SH に再通知（新 INSERT トリガーは走らないため移行後に手動通知 INSERT または `NOTIFY` 用補助関数） |
| `hr=rejected` | OLD 第1却下 | **`section_head_approval=rejected`**, `hr_approval=pending`, `hr_approved_by/at=null`, `rejection_reason=coalesce(rejection_reason, reason)` |
| `hr=approved`, `sh=rejected` | OLD 第2却下 | **`section_head_approval=rejected`** に意味を移す必要なし — 既に SH rejected。`hr` を `pending` に戻すか？ → **維持:** `hr=approved`, `sh=rejected` は「SH が第1で却下」に読み替え可能。`hr` を pending にリセット |
| `sh=approved`, `hr=rejected` | 稀 | **変更なし**（新フローで SH 済・HR 却下） |
| `sh=rejected`, `hr=pending` | — | **変更なし** |

**移行 SQL（概要）:**

```sql
-- 1) OLD: HR approved, SH still pending → reset HR stage
update public.requests
set hr_approval = 'pending',
    hr_approved_by = null,
    hr_approved_at = null
where hr_approval = 'approved'
  and section_head_approval = 'pending';

-- 2) OLD: HR rejected at stage 1 → map to SH rejected
update public.requests
set section_head_approval = 'rejected',
    section_head_approved_by = hr_approved_by,
    section_head_approved_at = hr_approved_at,
    hr_approval = 'pending',
    hr_approved_by = null,
    hr_approved_at = null,
    rejection_reason = coalesce(rejection_reason, left(reason, 1000))
where hr_approval = 'rejected'
  and section_head_approval = 'pending';

-- 3) OLD: HR approved + SH rejected → reset HR (SH rejection stands as stage-1 reject)
update public.requests
set hr_approval = 'pending',
    hr_approved_by = null,
    hr_approved_at = null,
    rejection_reason = coalesce(rejection_reason, left(reason, 1000))
where hr_approval = 'approved'
  and section_head_approval = 'rejected';
```

**移行後通知 / Post-migration notify:** ケース 1 でリセットされた行について、全 active `section_head` へ「Awaiting your approval」通知を `INSERT INTO notifications` で補填（移行用 PL/pgSQL ブロック）。

**ロールバック / Rollback:** マイグレーション前に `requests` の該当行スナップショットをエクスポート。`0004` の `down` はトリガー復元 + スナップショット復元手順を `implementation.md` に記載。

---

## DB トリガー | DB Triggers

**方針:** `0003_workflow.sql` の3関数を `DROP TRIGGER` + `CREATE OR REPLACE` で置換（ファイルは不変、新マイグレーションで上書き）。

### 1. 新規申請 → 全 Section Head 通知

| 旧 / Old | 新 / New |
|----------|----------|
| `trg_request_notify_hr` ON INSERT | `trg_request_notify_section_heads` ON INSERT |
| 通知先: 全 `hr_supervisor` | 通知先: 全 active `section_head` |

`sections.section_head_id` は**参照しない**（Takishi / Takai 両方に届ける）。

### 2. Section Head 決裁 → HR / 申請者

| 旧 / Old | 新 / New |
|----------|----------|
| `trg_request_notify_section_head` ON `hr_approval` UPDATE | `trg_request_notify_hr_on_sh_decision` ON `section_head_approval` UPDATE |

| `section_head_approval` 変化 | 通知 / Notify |
|------------------------------|---------------|
| → `approved` | 全 `hr_supervisor` + 申請者（SH 承認） |
| → `rejected` | **申請者のみ**（HR 非通知）、メッセージに `rejection_reason` を含める |

### 3. HR 決裁 → 申請者（完全承認 / 却下）

| 旧 / Old | 新 / New |
|----------|----------|
| `trg_request_finalize` ON `section_head_approval` UPDATE | `trg_request_notify_employee_hr` ON `hr_approval` UPDATE |

| `hr_approval` 変化 | 通知 / Notify |
|--------------------|---------------|
| → `approved`（かつ `section_head_approval=approved`） | 申請者「完全承認」— PDF は Server Action |
| → `rejected` | 申請者（HR 却下 + `rejection_reason`） |

---

## RLS・カラムガード | RLS & Column Guard

`tg_requests_column_guard`（`0002_rls_policies.sql`）を `0004` で更新:

| 変更 / Change | 内容 / Detail |
|---------------|---------------|
| `rejection_reason` | `section_head` が却下時のみ SH 更新可、`hr_supervisor` が却下時のみ HR 更新可。承認時は `rejection_reason` を変更不可（`old` 維持） |
| 段階順序ガード | SH: `section_head_approval` を `pending`→決定のみ。HR: `section_head_approval=approved` かつ `hr_approval=pending` のときのみ `hr_approval` 更新可 |
| `document_path` | 従来どおり HR/SH からは不可（admin client のみ） |

**新規ヘルパー（マイグレーション内）:**

```sql
-- HR が第2段階を更新できるか
section_head_approval = 'approved' and hr_approval = 'pending'
```

違反時は `raise exception`（Server Action でも二重チェック）。

---

## Server Actions | Server Actions

**ファイル:** `src/actions/approvals.ts`

### スキーマ拡張 | Validation

`src/lib/validations/requests.ts`:

```typescript
export const approvalDecisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().trim().min(5).max(1000).optional(),
}).refine(
  (d) => d.decision !== "rejected" || (d.rejectionReason?.length ?? 0) >= 5,
  { message: "validation.rejectionReasonRequired", path: ["rejectionReason"] }
);
```

### `sectionHeadDecide`（第1段階）

| 項目 / Item | 現行 / Current | 変更後 / After |
|-------------|----------------|----------------|
| 更新カラム | `section_head_approval` | 同左 |
| 前提条件 | なし | `section_head_approval = pending` |
| 却下 | `decision` のみ | `rejection_reason` 必須 |
| PDF | SH 承認時に生成 | **削除** — HR 承認へ移動 |

### `hrDecide`（第2段階）

| 項目 / Item | 現行 / Current | 変更後 / After |
|-------------|----------------|----------------|
| 前提条件 | なし | `section_head_approval = approved` かつ `hr_approval = pending` |
| 却下 | `decision` のみ | `rejection_reason` 必須 |
| PDF | なし | **`approved` 時に `finalizeRequestPdf` 呼び出し** |

`finalizeRequestPdf` の完全承認チェックは維持（`hr_approval` + `section_head_approval` 両方 `approved`）。

---

## UI | UI

### `ApprovalActions` (`src/components/requests/ApprovalActions.tsx`)

**日本語:** 却下クリック時にモーダル（Radix `Dialog`）で `rejection_reason` 入力（5文字以上）。承認は従来どおり即時。タッチターゲット 44×44px 維持。

**English:** Reject opens a Dialog for `rejection_reason` (min 5 chars). Approve unchanged. Keep 44×44px touch targets.

### `/approvals` (`src/app/(dashboard)/approvals/page.tsx`)

| キュー / Queue | 現行クエリ | 新クエリ |
|----------------|------------|----------|
| SH（第1） | `hr=approved`, `sh=pending` | `sh=pending` |
| HR（第2） | `hr=pending` | `sh=approved`, `hr=pending` |

タブ既定: **SH タブを先**（`defaultTab = isSH ? "sh" : "hr"`）。両方持つ `admin` は SH 優先。

### `/requests/[id]` 詳細

```typescript
// 変更後
const canSH = canApproveAsSectionHead(profile.role) && r.section_head_approval === "pending";
const canHR = canApproveAsHR(profile.role) && r.section_head_approval === "approved" && r.hr_approval === "pending";
```

却下済み `rejection_reason` を申請者・承認者に表示（マスタービューロール）。

### PDF ルート

`src/app/api/requests/[id]/pdf/route.ts` — 条件は両方 `approved` のまま（変更不要）。

---

## i18n

**追加キー（`ja.json` + `en.json`）:**

| キー / Key | 用途 / Use |
|------------|------------|
| `approvals.rejectionReasonLabel` | 却下理由ラベル |
| `approvals.rejectionReasonPlaceholder` | プレースホルダ |
| `approvals.rejectionDialogTitle` | ダイアログタイトル |
| `approvals.rejectionDialogConfirm` | 却下確定 |
| `validation.rejectionReasonRequired` | バリデーション |
| `requests.detail.rejectionReason` | 詳細表示 |

通知トリガー内の英語固定文言は本 Phase では**最小変更**（段階名のみ）。全面 i18n 化は別 Issue。

---

## セキュリティ | Security

| 項目 / Item | 対応 / Handling |
|-------------|-----------------|
| RLS | 既存 `requests_update_hr` / `requests_update_section_head` 維持 + 段階順序ガード |
| `rejection_reason` | XSS 対策: React テキストエスケープ（`dangerouslySetInnerHTML` 禁止） |
| Service Role | `finalizeRequestPdf` のみ（変更なし） |
| 認可 | Server Action で `canApproveAs*` + DB ガードの二重チェック |

---

## テスト方針 | Test Strategy

### 統合テスト（実 Supabase）| Integration — `tests/integration/approval-workflow.test.ts`

| # | シナリオ / Scenario |
|---|---------------------|
| 1 | 新規申請 INSERT → 全 `section_head` に通知、HR に通知なし |
| 2 | SH 承認 → HR キュー条件（`sh=approved`, `hr=pending`） |
| 3 | SH 却下 + `rejection_reason` → 申請者通知のみ、HR 通知なし |
| 4 | SH 却下、`rejection_reason` なし → DB / Action 拒否 |
| 5 | HR 承認（SH 済）→ PDF `document_path` 設定 |
| 6 | HR 却下 + `rejection_reason` → 申請者通知 |
| 7 | 移行 SQL 適用後、サンプル進行中行が破損しない |

**ヘルパー:** `tests/integration/helpers/env.ts` — テスト用 SH/HR プロファイル・申請作成。

### E2E（Playwright）| `tests/e2e/approval-workflow.spec.ts`

| # | シナリオ / Scenario |
|---|---------------------|
| 1 | SH ログイン → pending 承認 → HR ログイン → 承認 → PDF リンク表示 |
| 2 | SH 却下 → 理由入力 → 申請詳細に理由表示 |
| 3 | 375px ビューポートで却下ダイアログ操作可能 |

**タイムアウト:** 憲法固定値（15s test / 10s action）— 延長禁止。

### 単体 | Unit — `tests/unit/validations/approval-decision.test.ts`

- `approvalDecisionSchema`: reject without reason → fail
- reject with 4 chars → fail
- approve without reason → pass

---

## 変更ファイル一覧 | File Change List

| ファイル / File | 変更種別 / Change |
|-----------------|-------------------|
| `supabase/migrations/0006_approval_workflow_reorder.sql` | 新規 |
| `src/types/database.types.ts` | `rejection_reason` 追加 |
| `src/types/app.ts` | 同上（ラッパー型） |
| `src/lib/validations/requests.ts` | スキーマ拡張 |
| `src/actions/approvals.ts` | 段階チェック、PDF 移動、却下理由 |
| `src/components/requests/ApprovalActions.tsx` | 却下ダイアログ |
| `src/app/(dashboard)/approvals/page.tsx` | キュー反転 |
| `src/app/(dashboard)/requests/[id]/page.tsx` | canApprove 条件、理由表示 |
| `src/messages/ja.json`, `en.json` | i18n |
| `tests/integration/approval-workflow.test.ts` | 新規 |
| `tests/e2e/approval-workflow.spec.ts` | 新規 |
| `tests/unit/validations/approval-decision.test.ts` | 新規 |

**変更しない / Unchanged:** テーブル名 `requests`、ENUM `approval_status`、Storage パス、環境変数名。

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | プロジェクトオーナー | 2026-07-06 | [x] |
