# 承認ワークフロー改正 — 要件定義
# Approval Workflow Reorder — Requirements

> **Spec ID:** `specs/008-approval-workflow-reorder/`
> **Related Issue:** [#8](https://github.com/zevaFdo/Ssp_Attendence/issues/8)
> **Status:** approved (requirements)
> **Approved by:** プロジェクトオーナー — 2026-07-06

---

## 概要 | Overview

**日本語:** 現行の **HR（第1）→ 所属上長（第2）** 承認順序を、憲法・オーナー要件 v6 に合わせ **所属上長（第1）→ HR（第2）** に移行する。却下理由 `rejection_reason` を必須化する。Phase 1 のクリティカルパス。

**English:** Migrate approval order from **HR (1st) → Section Head (2nd)** to **Section Head (1st) → HR (2nd)** per constitution and owner v6. Make `rejection_reason` mandatory. Phase 1 critical path.

---

## スコープ | Scope

### 含む / In scope

**日本語:**

1. DB: 承認段階の意味を Section Head 第1 / HR 第2 に再マッピング
2. `rejection_reason` カラム追加（却下時必須）
3. トリガー書き換え: 新規申請 → **全 `section_head` に通知**；SH 却下 → 申請者のみ（HR 非通知）；SH 承認 → HR 通知
4. **Takishi / Takai どちらか一方**が stage 1 承認可（`sections.section_head_id` 単一 FK に依存しない）
5. `hr_supervisor` が stage 1 兼務可（該当者が SH ロールを兼ねる場合）
6. Server Actions・承認 UI 更新（却下理由入力、キュー順序）
7. 統合テスト + E2E
8. 進行中申請の**データ移行戦略**（`technical.md` で定義）

**English:**

1. DB: remap stages — Section Head 1st, HR 2nd
2. Add `rejection_reason` column (required on reject)
3. Rewrite triggers: new request → notify all `section_head`; SH reject → applicant only (no HR); SH approve → notify HR
4. Either Takishi or Takai may approve stage 1 (do not rely solely on `sections.section_head_id`)
5. `hr_supervisor` may act at stage 1 when applicable
6. Update Server Actions and approval UI (rejection reason, queue order)
7. Integration tests + E2E
8. In-flight request **migration strategy** (defined in `technical.md`)

### 含まない / Out of scope

**日本語:**

- 申請種別拡張（WFH、OOO 等）— `specs/011`
- 承認後の勤怠ボード自動反映 — `specs/012`
- 有給連動 — `specs/013`
- Teams / PDF テンプレートの業務文言全面改訂（最小限の段階名変更のみ可）

**English:**

- Request type expansion — `specs/011`
- Post-approval attendance board sync — `specs/012`
- Paid leave integration — `specs/013`
- Full Teams/PDF copy overhaul (stage-name updates only)

---

## 目標フロー | Target Flow

```
申請者 → 所属上長（section_head、Takishi OR Takai）→ HR（Miki / hr_supervisor）→ PDF + 完了
              ↓ 却下（理由必須）              ↓ 却下（理由必須）
         申請者のみ通知                   申請者通知

Applicant → Section Head (either SH) → HR → PDF + complete
              ↓ reject (reason)           ↓ reject (reason)
         applicant only              applicant notify
```

| 段階 / Stage | 担当 / Role | 操作 / Action |
|--------------|-------------|---------------|
| 第1 / 1st | `section_head`（いずれか一方 / either one） | 承認 / 却下（`rejection_reason` 必須） |
| 第2 / 2nd | `hr_supervisor` | 承認 / 却下（`rejection_reason` 必須） |
| 完了 / Done | システム | PDF 生成、Storage、通知（**第2承認後**） |

### 通知ルール | Notification rules

| イベント / Event | 通知先 / Notify |
|------------------|-----------------|
| 新規申請 / New request | 全 active `section_head` |
| SH 承認 / SH approve | HR（`hr_supervisor`）、申請者 |
| SH 却下 / SH reject | **申請者のみ**（HR 非通知） |
| HR 承認 / HR approve | 申請者；PDF 生成 |
| HR 却下 / HR reject | 申請者 |

---

## 受け入れ条件 | Acceptance Criteria

**日本語:**

1. 新規申請は Section Head 承認キューに表示され、HR キューには SH 承認後のみ表示される
2. 却下時に `rejection_reason` が空だと DB・Server Action ともに拒否される（最小文字数は現行理由欄と同等、5文字以上を維持）
3. Section Head 却下時、HR ユーザーに通知が作成されない
4. Takishi と Takai のいずれか一方の承認で stage 1 が完了する
5. 両段階承認完了後にのみ PDF が生成され `document_path` が設定される
6. ベースライン `0003_workflow.sql` の HR-first トリガーが置換または無効化されている
7. 統合テストが実 Supabase で承認順序・却下理由・通知先を検証する
8. E2E が `/approvals` で SH→HR フローを通過する
9. 移行戦略に従い、移行前に pending だった申請が破損しない（`technical.md` で検証手順）

**English:**

1. New requests appear in Section Head queue first; HR queue only after SH approval
2. Reject without `rejection_reason` is blocked at DB and Server Action (min length aligned with current reason field, ≥5 chars)
3. Section Head rejection does not create HR notifications
4. Either Takishi or Takai can complete stage 1
5. PDF generates only after both stages approve
6. HR-first triggers from `0003_workflow.sql` replaced or disabled
7. Integration tests on real Supabase verify order, rejection reason, and notification targets
8. E2E passes SH→HR flow on `/approvals`
9. In-flight requests remain valid per migration strategy in `technical.md`

---

## 業務ルール | Business Rules

**日本語:** 憲法 XI・`docs/requirements/owner-brief-v6.md` に準拠。UI のみの順序入れ替えは禁止 — DB カラム意味・トリガー・Server Actions を一括更新する。

**English:** Align with Constitution XI and `docs/requirements/owner-brief-v6.md`. UI-only reorder is forbidden — update DB column semantics, triggers, and Server Actions together.

---

## リスク | Risks

| リスク / Risk | 緩和 / Mitigation |
|---------------|-------------------|
| 進行中申請の stage 解釈が壊れる | `technical.md` に移行スクリプトとロールバック手順 |
| `section_head_id` FK と複数 SH | ロール `section_head` 全員に通知；承認権はロールベース |
| PDF 生成タイミング変更 | 第2承認後のみ；統合テストで検証 |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | プロジェクトオーナー | 2026-07-06 | [x] |
