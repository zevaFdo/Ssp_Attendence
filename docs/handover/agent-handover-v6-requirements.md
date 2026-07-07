# エージェント引き継ぎ — v6 要件実装
# Agent Handover — v6 Requirements Implementation

> **作成日 / Created:** 2026-07-06  
> **Status:** Phase 0 approved (2026-07-06) — implementation not started  
> **対象読者 / Audience:** Cursor / Codex / 後続 AI エージェント、人間レビュアー  
> **チャット言語 / Chat language:** English（`.cursorrules`）

---

## 目的 | Purpose

**日本語:** プロジェクトオーナーが整理した勤怠 Web 要件（**v6**）を、現行コードベース・憲法・ベースライン仕様と照合し、**フェーズ別に実装する**ための引き継ぎ文書。コード変更は本 Issue の承認後、仕様書（`specs/`）承認後に開始すること。

**English:** Handover for the next agent to implement **owner requirements v6** against the current codebase, constitution, and baseline specs. **Do not write production code** until Phase 0 is approved and the relevant `specs/[ID]-*/` three-stage spec is approved.

---

## 最初に読むもの | Read First (Mandatory)

| 順序 | パス | 内容 |
|------|------|------|
| 1 | `memory/constitution.md` | 開発憲法（最上位） |
| 2 | `docs/onboarding/01-constitution-essence.md` | 10分要約 |
| 3 | `.cursorrules` / `AGENTS.md` | エージェント指示 |
| 4 | **本ファイル** | v6 要件・ギャップ・フェーズ計画 |
| 5 | `specs/001`〜`006` | 現行ベースライン（承認済み） |

---

## タスク概要 | Task Summary

**日本語:** オーナー要件 v6 を満たすよう、憲法改正（必要箇所）→ GitHub Issue → `specs/007+` 3段階仕様 → テストファースト実装の順で段階的に構築する。

**English:** Deliver v6 owner requirements via: constitution amendment (where needed) → GitHub Issues → approved 3-stage specs (`specs/007+`) → test-first implementation, phase by phase.

**現フェーズ / Current phase:** **Phase 1**（承認ワークフロー改正）— `specs/008` technical 起草済み → **人間承認待ち**

**次の具体タスク / Immediate next task:**

1. **`specs/008-approval-workflow-reorder/technical.md`** — 起草済み → **人間承認を得る**
2. **`specs/008/implementation.md`** 起草 → 承認
3. テストファースト実装（RED → GREEN）— `specs/008` 承認後のみ

---

## オーナー要件 v6 要約 | Owner Requirements v6 Summary

### 会社ルール | Company rules

| 項目 | 値 |
|------|-----|
| 始業 / 終業 | 09:00 / 17:30 |
| 通常昼食 | 12:00〜13:00（この時間外のみ Lunch ステータス） |
| 休日 | 土日・祝日・会社特別休日 |
| 会社特別休日 | **12/29〜1/4**（年末年始）、**8/14〜8/16**（お盆） |
| 休日の操作ブロック | **しない** |
| 有給年度 | **入社+6か月**の anniversary（4月年度ではない） |

### 日次ステータス | Daily status board

| 操作 | 承認 | ボード更新 |
|------|------|------------|
| Present | 不要 | 即時 |
| WFH（HR 指定の固定曜日） | 不要 | 即時 |
| WFH（固定日以外） | 要 | 承認後（スケジュール連動） |
| In Meeting | 不要 | 即時 |
| Lunch（12:00〜13:00 外） | 不要 | 即時 |
| OOO 公務（同僚最大10名） | 不要 | 即時＋同僚通知 |
| OOO 私用 | 要 | 承認後 |
| Clock Out（17:30以降） | 不要 | 即時 |
| Clock Out 早退（17:30前） | 要 | Clock Out 内分岐 |
| Late | 要 | 承認後 |

**未打刻:** 09:00 以降、従業員がステータスを付けていない場合、ボードは**自動更新**。後から変更可能。理由が **「更新し忘れ」** の場合 → **HR に通知**。

**スケジュール反映:** 承認済み未来イベントは従業員スケジュールに保存。イベント当日は**再承認不要**でボードに自動表示。**08:00** から **17:00** まで**毎時**リフレッシュ。

### 承認フロー | Approval flow

```
申請 → 所属上長（Takishi OR Takai のどちらか一方）→ HR（Miki）→ 適用
却下時は理由必須。所属上長却下時は HR に通知しない。
```

- 申請は**イベント前・後**どちらも可  
- イベント日は申請時に従業員が指定し、**提出後は変更不可**（再申請）  
- 過去/当日承認 → 即時ボード更新  
- 未来承認 → スケジュール保存 → イベント日に自動表示  

### 休暇区分 | Leave types

| 区分 | 時間帯 |
|------|--------|
| 終日 | 09:00〜17:30 相当 |
| 午前短時間休 | 09:00〜14:00 |
| 午後短時間休 | 13:00〜17:30 |

### 補填方法 | Compensation (Late・私用 OOO)

- 勤務時間延長（**Late / 私用 OOO に紐づく。独立申請不可。延長実績の記録は不要**）
- 有給時間休
- 無給休

### WFH 固定曜日 | Default WFH weekday

- **HR が割当**（従業員は自己変更不可）  
- 変更は申請 → 所属上長 → HR。理由必須。**翌週のみ** or **恒久的**。

### 管理者モデル | Admin model (v3/v6)

| 人物 | 管理者種別 | ロール |
|------|------------|--------|
| Miki さん | HR 管理者 | `hr_supervisor` |
| Takishi さん | 通常管理者 | `section_head` |
| Takai さん | 通常管理者 | `section_head` |

- **二重アカウント不要** — 同一ログインで管理＋従業員操作  
- 管理者は全従業員のステータス変更可（現行はチームリーダーのみチーム内）  
- 休日カレンダーは**管理者**が保守  

### 有給 | Paid leave

- 入社6か月後起算、勤続年で 10→20 日、繰越最大2年、時間休40h/年、年5日義務、年度末2か月前警告  
- **未実装** — Phase 6

---

## 現行実装とのギャップ | Gap vs Current Codebase

**ベースライン仕様:** `specs/001`〜`006`（2026-06-26 承認）

| 領域 | 現行 | v6 目標 | 優先フェーズ |
|------|------|---------|--------------|
| 承認順序 | **HR → 所属上長** (`0003_workflow.sql`) | 所属上長 → HR | **Phase 1** |
| 却下理由 | なし | `rejection_reason` 必須 | Phase 1 |
| 申請種別 | `leave`, `late` のみ | 休暇4区分、OOO、WFH 等 | Phase 4 |
| 承認→勤怠連動 | なし | 自動ボード更新 | Phase 5 |
| 従業員スケジュール | なし | 新テーブル＋毎時ジョブ | Phase 5 |
| 未打刻自動更新 | なし（手動 Present のみ 09:15 遅刻判定） | 09:00 以降自動＋忘れ通知 | Phase 3 |
| 公式 OOO＋同僚 | なし | 一括更新＋通知 | Phase 3 |
| 早退 | 単純 clock_out | 17:30 前は承認分岐 | Phase 3/4 |
| WFH 固定曜日 | なし | HR 割当 | Phase 2 |
| 休日カレンダー | なし | 特別休日含む | Phase 2 |
| 有給 | なし | フルエンジン | Phase 6 |
| 管理者 UI | `admin` ロールのみ | HR/SH も管理＋従業員操作 | Phase 7 |

**重要ファイル（現行）:**

- `supabase/migrations/0003_workflow.sql` — 承認トリガー（**逆順**）
- `src/actions/attendance.ts` — ステータス状態機械、`LATE_MINUTE_CUTOFF = 15`
- `supabase/migrations/0001_init_schema.sql` — ENUM・テーブル定義
- `src/lib/validations/` — Zod スキーマ

---

## 憲法改正が必要な項目 | Constitution Amendments Required

**版上げ案:** `memory/constitution.md` **v1.2.0**（人間承認後に反映）

| 項目 | 現行憲法 | v6 | 対応 |
|------|----------|-----|------|
| 有給年度 | 未設定時 4月〜3月（IV） | 入社+6か月 anniversary | **改正** |
| 休暇単位 | 終日/午前休/午後休 | 短時間休 9-14 / 13-17:30 | **改正** |
| 外出 | 単一「外出」 | 公務 vs 私用 | **改正** |
| 早退 | 独立申請種別 | Clock Out 内分岐 | **改正** |
| WFH 固定曜日 | 未記載 | HR 割当・変更申請 | **追加** |
| 会社特別休日 | 未記載 | 年末年始・お盆 | **追加** |
| スケジュール承認 | 未記載 | 事前/事後申請・毎時反映 | **追加** |
| 未打刻自動処理 | 未記載 | 09:00 以降・忘れ通知 | **追加** |
| 時間延長記録 | 時間変更あり | **記録不要**と明記 | **明確化** |
| 管理者 | ロール表のみ | HR/通常管理者・単一アカウント | **明確化** |

**改正なしでよいもの:** 禁止リネーム一覧、Section Head→HR（既に憲法目標）、テストファースト、RLS、タイムアウト固定値。

---

## フェーズ実装計画 | Phased Implementation Plan

```
Phase 0  ガバナンス・未決定確定・Issue 起票
    ↓
Phase 1  承認ワークフロー改正（クリティカルパス）     specs/008
    ↓
Phase 2  休日カレンダー・WFH 固定曜日               specs/009
    ↓
Phase 3  勤怠ステータスルール（OOO・早退・未打刻）   specs/010
    ↓
Phase 4  申請種別拡張                                 specs/011
    ↓
Phase 5  スケジュール・自動ボード・毎時ジョブ         specs/012
    ↓
Phase 6  有給管理                                     specs/013
    ↓
Phase 7  管理者モデル・単一アカウント               specs/014
    ↓
Phase 8  取消・編集（憲法バックログ）                 specs/015
```

### 提案 spec ID 一覧 | Proposed spec IDs

| ID | ディレクトリ名 | GitHub Issue（要起票） |
|----|----------------|------------------------|
| 007 | `007-constitution-amendment-v6-domain` | 憲法 v1.2.0 |
| 008 | `008-approval-workflow-reorder` | 承認順序・却下理由 |
| 009 | `009-company-calendar-wfh-profile` | 休日・WFH 曜日 |
| 010 | `010-attendance-status-rules` | ステータス挙動 |
| 011 | `011-request-types-expansion` | 申請拡張 |
| 012 | `012-employee-schedule-auto-board` | スケジュール・自動反映 |
| 013 | `013-paid-leave-management` | 有給 |
| 014 | `014-admin-roles-unified-account` | 管理者 |
| 015 | `015-request-cancel-edit` | 取消・編集 |

---

## 未決定事項（Phase 0 で確定）| Open Items (Resolve in Phase 0)

| # | 質問 | 影響 |
|---|------|------|
| 1 | 09:00 以降未打刻の**自動ステータス**は `absent` か `late` か？ | Phase 3 スケジューラ | **`late`** ✅ |
| 2 | 自動更新の**正確な分**（09:01? 09:15?） | Phase 3 | **`09:00`** ✅ |
| 3 | 休暇申請にも Late/OOO と同じ**補填3択**を付けるか？ | Phase 4 フォーム | **いいえ**（Late・私用 OOO のみ）✅ |
| 4 | 未来イベントを**イベント日前**からボードに表示するか？ | Phase 5 UI | **いいえ**（当日のみ）✅ |
| 5 | **遡及申請**の上限日数は？ | Phase 4 バリデーション | **30日** ✅ |
| 6 | WFH「翌週のみ」= **暦週（月〜日）** か **承認から7日間** か？ | Phase 2/4 | **暦週（月〜日）** ✅ |

---

## エージェント作業ルール | Agent Working Rules

### 必ず守る | Must do

- 実装前に `specs/[ID]-*/requirements.md` → `technical.md` → `implementation.md` の**段階承認**
- **テストファースト**（RED commit → GREEN → refactor）
- 統合テストは**実 Supabase**
- UI 文言は `src/messages/ja.json` + `en.json` 両方
- commit メッセージ・コードコメントは**日本語**
- チャット応答は**英語**
- スキーマ変更時: マイグレーション + `database.types.ts` + RLS + 統合テストを**セット**
- UI 変更時: Playwright + **375px** 手動確認

### 禁止 | Must not

- 仕様書なしの実装（憲法 I）
- 実装後にだけテストを書く（憲法 II）
- 禁止リネーム（`profiles`, `requests`, `user_role` 値等）— `.cursorrules` 参照
- タイムアウト延長（テスト15秒・本番10秒）
- クライアントでの Service Role Key
- 承認順序の UI だけのパッチ（DB トリガーと一括移行）
- **ユーザーの明示的な依頼なしに git commit / push しない**

---

## Phase 0 チェックリスト | Phase 0 Checklist

- [x] 未決定6項目のオーナー回答を記録（2026-07-06 確定）
- [x] `docs/requirements/owner-brief-v6.md` 作成（v6 正本）
- [x] `memory/constitution.md` v1.2.0 改正（2026-07-06 承認済み）
- [x] `docs/onboarding/01-constitution-essence.md` 更新
- [x] GitHub Issues #7〜#15 起票
- [x] `specs/007-constitution-amendment-v6-domain/requirements.md` 承認済み
- [x] `specs/008-approval-workflow-reorder/requirements.md` 承認済み

## Phase 1 チェックリスト | Phase 1 Checklist

- [x] `specs/008/technical.md` 人間承認（2026-07-06）
- [x] `specs/008/implementation.md` 起草・承認
- [x] 実装（マイグレーション・Server Actions・UI・i18n）
- [x] 単体テスト PASS
- [ ] 統合テスト（要 `0004` マイグレーション適用 + 実 Supabase）
- [ ] E2E フルフロー（要認証シード）
- [ ] テスト RED/GREEN commit・PR

---

## Phase 1 プレビュー（次の実装フェーズ）| Phase 1 Preview

**specs/008** で扱う内容:

1. DB: 承認段階の意味を Section Head 第1 / HR 第2 に再マッピング  
2. `rejection_reason` カラム追加  
3. トリガー書き換え: 新規申請 → **全 `section_head` に通知**；SH 却下 → 申請者のみ；SH 承認 → HR  
4. **Takishi / Takai どちらか一方**が stage 1 承認可  
5. `hr_supervisor` が stage 1 兼務可  
6. Server Actions・承認 UI 更新  
7. 統合テスト + E2E  
8. 進行中申請の**データ移行戦略**（technical.md で定義）

---

## リスク | Risks

| リスク | 深刻度 | 緩和 |
|--------|--------|------|
| 承認順序マイグレーションで進行中申請が壊れる | 高 | 移行スクリプト・technical.md で手順化 |
| 毎時ジョブ（08:00–17:00）の信頼性 | 高 | pg_cron / Edge Function、冪等な apply 関数 |
| Phase 5 の範囲膨張 | 高 | 即時適用とスケジュール適用を implementation.md で分離 |
| `sections.section_head_id` と複数 SH | 中 | ロール `section_head` 全員に通知、単一 FK に依存しない |
| 管理者 UI が `admin` のみ | 中 | Phase 7 で権限拡張（早期に permissions 設計） |

---

## 会話経緯 | Conversation History

要件は複数チャットで段階的に整理。最終版 **v6** の主な確定事項:

1. 昼食 12:00–13:00、承認後自動ボード更新  
2. 有給年度 = 入社+6か月  
3. 早退 = Clock Out 内（17:30前）  
4. 管理者二重アカウント廃止 → 単一アカウント  
5. Takishi / Takai とも section_head、どちらかが stage 1 承認  
6. 会社特別休日・休日ブロックなし  
7. スケジュール毎時 08:00–17:00、イベント日再承認不要  
8. 未打刻自動更新＋「更新し忘れ」で HR 通知  
9. 延長勤務の**実績記録は不要**

---

## 関連リンク | Related Paths

```
memory/constitution.md
docs/onboarding/01-constitution-essence.md
docs/handover/agent-handover-v6-requirements.md   ← 本ファイル
docs/requirements/owner-brief-v6.md               ← Phase 0 で作成予定
specs/001-baseline-auth/ … specs/006-baseline-admin/
specs/008-approval-workflow-reorder/              ← Phase 1 で作成予定
src/actions/attendance.ts
supabase/migrations/
```

---

## 承認 | Sign-off

| 段階 | 担当 | 日付 | 署名 |
|------|------|------|------|
| 引き継ぎ文書 | AI + オーナー確認待ち | 2026-07-06 | [ ] |
| Phase 0 完了 | プロジェクトオーナー | 2026-07-06 | [x] |
| Phase 1 requirements | プロジェクトオーナー | 2026-07-06 | [x] |
| Phase 1 technical | プロジェクトオーナー | | [ ] |

---

**English one-liner for agents:** Read constitution → read this handover → complete Phase 0 (constitution v1.2.0 + open questions) → write and get approval for `specs/008-approval-workflow-reorder/requirements.md` before any production code.
