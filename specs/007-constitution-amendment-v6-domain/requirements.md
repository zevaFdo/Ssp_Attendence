# 憲法 v1.2.0 改正（v6 ドメイン）— 要件定義
# Constitution v1.2.0 Amendment (v6 Domain) — Requirements

> **Spec ID:** `specs/007-constitution-amendment-v6-domain/`
> **Related Issue:** [#7](https://github.com/zevaFdo/Ssp_Attendence/issues/7)
> **Status:** approved
> **Source:** `docs/requirements/owner-brief-v6.md`
> **Approved by:** プロジェクトオーナー — 2026-07-06

---

## 概要 | Overview

**日本語:** オーナー要件 v6 に合わせ、`memory/constitution.md` を **v1.1.0 → v1.2.0** に改正する。コード変更は含まない。改正承認後、`docs/onboarding/01-constitution-essence.md` を同期更新する。

**English:** Amend `memory/constitution.md` from **v1.1.0 → v1.2.0** to align with owner requirements v6. No production code in this spec. After approval, sync `docs/onboarding/01-constitution-essence.md`.

---

## スコープ | Scope

### 含む / In scope

**日本語:**

- 原則 IV（有給年度）の改正
- ドメイン仕様：休暇区分・外出（公務/私用）・早退（Clock Out 内分岐）
- ドメイン仕様追加：WFH 固定曜日、会社特別休日、スケジュール承認、未打刻自動処理
- 処理方法の明確化：時間延長の実績記録不要
- ロール・管理者モデルの明確化（HR/通常管理者・単一アカウント）
- 実装ギャップ表の v6 向け更新
- 版情報・改正履歴の更新

**English:**

- Amend Principle IV (paid-leave fiscal year)
- Domain spec: leave types, OOO (official/private), early leave as Clock Out branch
- New domain sections: WFH weekday, company holidays, schedule approval, auto missing-status
- Clarify: no extension-hours recording
- Clarify admin model (HR/section admins, single account)
- Update implementation gaps table for v6
- Version metadata and amendment history

### 含まない / Out of scope

**日本語:**

- 承認順序の DB/UI 実装（`specs/008`）
- 未決定6項目の確定値（オーナー回答後に憲法へ追記）
- 本番コード・マイグレーション

**English:**

- Approval-order DB/UI implementation (`specs/008`)
- Resolved values for 6 open items (append to constitution after owner answers)
- Production code or migrations

---

## 改正一覧 | Amendment List

| 項目 / Item | v1.1.0 | v1.2.0 (v6) |
|-------------|--------|-------------|
| 有給年度 / Fiscal year | 未設定時 4月〜3月 | 入社+6か月 anniversary |
| 休暇単位 / Leave units | 終日/午前休/午後休 | 終日、午前短時間休 9–14、午後短時間休 13–17:30 |
| 外出 / Out-of-office | 単一「外出」 | 公務 vs 私用 |
| 早退 / Early leave | 独立申請種別 | Clock Out 内分岐（17:30前） |
| WFH 固定曜日 | 未記載 | HR 割当・変更申請（翌週/恒久） |
| 会社特別休日 | 未記載 | 12/29–1/4、8/14–8/16；休日ブロックなし |
| スケジュール | 未記載 | 事前/事後申請、毎時 08:00–17:00 反映 |
| 未打刻 | 未記載 | 09:00 以降自動更新、「更新し忘れ」で HR 通知 |
| 時間延長 | 時間変更あり | 延長実績記録不要と明記 |
| 管理者 | ロール表のみ | HR/通常管理者・単一アカウント・全員ステータス変更可 |

**改正なし / Unchanged:** 禁止リネーム、Section Head→HR（原則 XI）、テストファースト、RLS、タイムアウト固定値。

---

## 受け入れ条件 | Acceptance Criteria

**日本語:**

1. `memory/constitution.md` が v1.2.0 として版情報を更新している
2. 上記改正一覧のすべてが憲法本文に日英併記で反映されている
3. `docs/requirements/owner-brief-v6.md` と矛盾がない
4. `docs/onboarding/01-constitution-essence.md` が v1.2.0 ダイジェストに更新されている
5. 未決定事項は憲法に「TBD / オーナー確定待ち」と明記し、確定後に追記する手順が implementation.md に記載されている

**English:**

1. `memory/constitution.md` shows version v1.2.0
2. All amendments above are reflected bilingually in the constitution body
3. No conflict with `docs/requirements/owner-brief-v6.md`
4. `docs/onboarding/01-constitution-essence.md` digest updated for v1.2.0
5. Open items marked TBD in constitution; procedure to append after owner resolution documented in implementation.md

---

## 業務ルール | Business Rules

**日本語:** 本 spec は文書改正のみ。業務ルールの正本は `docs/requirements/owner-brief-v6.md`。憲法は最上位の開発・品質原則とドメイン仕様の統合文書である。

**English:** This spec is documentation only. Canonical business rules: `docs/requirements/owner-brief-v6.md`. The constitution integrates top-level development principles and domain specification.

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | プロジェクトオーナー | 2026-07-06 | [x] |
