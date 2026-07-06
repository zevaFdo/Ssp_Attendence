# オーナー要件 v6 — 正本
# Owner Requirements v6 — Canonical Brief

> **Version:** v6  
> **Status:** approved by owner (requirements content); open items **resolved 2026-07-06**  
> **Created:** 2026-07-06  
> **Syncs with:** `docs/handover/agent-handover-v6-requirements.md`  
> **Supersedes:** informal v1–v5 chat notes for domain rules

---

## 概要 | Overview

**日本語:** プロジェクトオーナーが整理した勤怠 Web の業務要件（**v6**）。本書が v6 ドメインルールの**正本**。憲法 v1.2.0・`specs/007+`・実装は本書に従う。未決定事項は Phase 0 で確定するまで実装しない。

**English:** Owner-defined business requirements for Attendance Web (**v6**). This document is the **canonical source** for v6 domain rules. Constitution v1.2.0, `specs/007+`, and implementation must align with this brief. Do not implement open items until resolved in Phase 0.

---

## 会社ルール | Company Rules

| 項目 / Item | 値 / Value |
|-------------|------------|
| 始業 / Start | **09:00** |
| 終業 / End | **17:30** |
| 通常昼食 / Standard lunch | **12:00–13:00**（この時間外のみ Lunch ステータス可 / Lunch status only outside this window） |
| 休日 / Holidays | 土日・祝日・会社特別休日 / Sat/Sun, national holidays, company special holidays |
| 会社特別休日 / Company special holidays | **12/29–1/4**（年末年始）、**8/14–8/16**（お盆） |
| 休日の操作ブロック / Holiday operation block | **しない** / No blocking — employees may still operate |
| 有給年度 / Paid-leave fiscal year | **入社日 + 6か月**の anniversary（4月年度ではない）/ Anniversary from hire + 6 months (not April fiscal year) |

---

## 日次ステータスボード | Daily Status Board

| 操作 / Action | 承認 / Approval | ボード更新 / Board update |
|---------------|-----------------|---------------------------|
| Present | 不要 / None | 即時 / Immediate |
| WFH（HR 指定の固定曜日）/ WFH (HR-assigned weekday) | 不要 / None | 即時 / Immediate |
| WFH（固定日以外）/ WFH (other days) | 要 / Required | 承認後（スケジュール連動）/ After approval (schedule-linked) |
| In Meeting | 不要 / None | 即時 / Immediate |
| Lunch（12:00–13:00 外）/ Lunch (outside 12–13) | 不要 / None | 即時 / Immediate |
| OOO 公務（同僚最大10名）/ Official OOO (up to 10 colleagues) | 不要 / None | 即時＋同僚通知 / Immediate + colleague notify |
| OOO 私用 / Private OOO | 要 / Required | 承認後 / After approval |
| Clock Out（17:30以降）/ Clock Out (≥17:30) | 不要 / None | 即時 / Immediate |
| Clock Out 早退（17:30前）/ Early Clock Out (<17:30) | 要 / Required | Clock Out 内分岐 / Branch inside Clock Out |
| Late | 要 / Required | 承認後 / After approval |

### 未打刻 | Missing status

**日本語:** 09:00 以降、従業員がステータスを付けていない場合、**09:00 ちょうど**にボードを **`late`** に**自動更新**する。後から変更可能。理由が **「更新し忘れ」** の場合 → **HR に通知**。

**English:** After 09:00, if an employee has no status, the board is **auto-updated** to **`late`** at **09:00** exactly. They may change it later. If the reason is **"forgot to update"** → **notify HR**.

### スケジュール反映 | Schedule reflection

**日本語:** 承認済み未来イベントは従業員スケジュールに保存。イベント当日のみボードに自動表示（**イベント日前は表示しない**）。**08:00–17:00** まで**毎時**リフレッシュ。

**English:** Approved future events are stored on the employee schedule. On the event date, the board auto-displays **without re-approval** (not before event day). Hourly refresh **08:00–17:00**.

---

## 承認フロー | Approval Flow

```
申請 → 所属上長（Takishi OR Takai のどちらか一方）→ HR（Miki）→ 適用
却下時は理由必須。所属上長却下時は HR に通知しない。

Request → Section Head (Takishi OR Takai, either one) → HR (Miki) → Apply
Rejection reason required. Section Head rejection does NOT notify HR.
```

| ルール / Rule | 内容 / Detail |
|---------------|---------------|
| 申請タイミング / When to apply | イベント前・後どちらも可 / Before or after event |
| イベント日 / Event date | 提出時に指定、**提出後は変更不可**（再申請）/ Set at submit; **immutable** after submit (re-apply) |
| 過去/当日承認 / Past or same-day approval | 即時ボード更新 / Immediate board update |
| 未来承認 / Future approval | スケジュール保存 → イベント日に自動表示（日前は非表示）/ Schedule → auto-display on event day only |
| 遡及申請 / Retroactive | 最大 **30日** 前まで / Max **30 days** back |

---

## 休暇区分 | Leave Types

| 区分 / Type | 時間帯 / Time range |
|-------------|---------------------|
| 終日 / Full day | 09:00–17:30 相当 / equivalent |
| 午前短時間休 / AM short leave | **09:00–14:00** |
| 午後短時間休 / PM short leave | **13:00–17:30** |

---

## 補填方法 | Compensation (Late・私用 OOO)

**日本語:**

- 勤務時間延長（**Late / 私用 OOO に紐づく。独立申請不可。延長実績の記録は不要**）
- 有給時間休
- 無給休

**English:**

- Work-time extension (**tied to Late / private OOO only; not a standalone request; no extension-hours recording**)
- Paid leave (hours)
- Unpaid leave

**確定 / Resolved:** 休暇申請には補填3択を**付けない**（Late・私用 OOO のみ）/ Leave requests do **not** include compensation options.

---

## WFH 固定曜日 | Default WFH Weekday

**日本語:**

- **HR が割当**（従業員は自己変更不可）
- 変更は申請 → 所属上長 → HR。理由必須。**翌週のみ**（**暦週・月〜日**） or **恒久的**

**English:**

- **HR assigns** (employees cannot self-change)
- Change via request → Section Head → HR; reason required. **Next calendar week (Mon–Sun)** or **permanent**

## 管理者モデル | Admin Model

| 人物 / Person | 管理者種別 / Admin type | ロール / Role |
|---------------|-------------------------|---------------|
| Miki さん | HR 管理者 / HR admin | `hr_supervisor` |
| Takishi さん | 通常管理者 / Section admin | `section_head` |
| Takai さん | 通常管理者 / Section admin | `section_head` |

**日本語:**

- **二重アカウント不要** — 同一ログインで管理＋従業員操作
- 管理者は全従業員のステータス変更可（現行はチームリーダーのみチーム内）
- 休日カレンダーは**管理者**が保守

**English:**

- **No duplicate accounts** — single login for admin + employee actions
- Admins may change any employee's status (current: team_leader only within team)
- Holiday calendar maintained by **admins**

---

## 有給 | Paid Leave (Phase 6)

**日本語:** 入社6か月後起算、勤続年で 10→20 日、繰越最大2年、時間休40h/年、年5日義務、年度末2か月前警告。**未実装** — Phase 6（`specs/013`）。

**English:** Accrual from hire + 6 months; tenure-based 10→20 days; carry-over max 2 years; 40h/year hourly leave; 5-day annual obligation; warn 2 months before year-end. **Not implemented** — Phase 6 (`specs/013`).

---

## 未決定事項 | Open Items (Phase 0)

| # | 質問 / Question | 影響 / Impact | 回答 / Answer |
|---|-----------------|---------------|---------------|
| 1 | 09:00 以降未打刻の**自動ステータス**は `absent` か `late` か？ / Auto status: `absent` or `late`? | Phase 3 スケジューラ | **`late`**（2026-07-06 確定） |
| 2 | 自動更新の**正確な分**（09:01? 09:15?）/ Exact minute for auto-update? | Phase 3 | **`09:00`** ちょうど（2026-07-06 確定） |
| 3 | 休暇申請にも Late/OOO と同じ**補填3択**を付けるか？ / Same 3 compensation options on leave? | Phase 4 フォーム | **いいえ** — Late・私用 OOO のみ（2026-07-06 確定） |
| 4 | 未来イベントを**イベント日前**からボードに表示するか？ / Show future events on board before event day? | Phase 5 UI | **いいえ** — イベント日のみ（2026-07-06 確定） |
| 5 | **遡及申請**の上限日数は？ / Retroactive request limit (days)? | Phase 4 バリデーション | **30日**（2026-07-06 確定） |
| 6 | WFH「翌週のみ」= **暦週（月〜日）** か **承認から7日間** か？ / Next week = calendar week or 7 days from approval? | Phase 2/4 | **暦週（月〜日）**（2026-07-06 確定） |

---

## 実装フェーズ対応 | Phase Mapping

| Phase | Spec ID | 内容 / Content |
|-------|---------|----------------|
| 0 | — | ガバナンス・未決定確定・Issue 起票 |
| 0 | 007 | 憲法 v1.2.0 改正 |
| 1 | 008 | 承認ワークフロー改正（クリティカルパス） |
| 2 | 009 | 休日カレンダー・WFH 固定曜日 |
| 3 | 010 | 勤怠ステータスルール（OOO・早退・未打刻） |
| 4 | 011 | 申請種別拡張 |
| 5 | 012 | スケジュール・自動ボード・毎時ジョブ |
| 6 | 013 | 有給管理 |
| 7 | 014 | 管理者モデル・単一アカウント |
| 8 | 015 | 取消・編集 |

---

## 関連文書 | Related Documents

- `memory/constitution.md` v1.2.0（改正案）
- `docs/handover/agent-handover-v6-requirements.md`
- `specs/001`–`006`（ベースライン、承認済み）
- `specs/007`–`015`（v6 移行）

---

## 承認 | Sign-off

| 段階 / Stage | 担当 / Owner | 日付 / Date | 署名 / Sign-off |
|--------------|--------------|-------------|-----------------|
| v6 要件内容 / Requirements content | プロジェクトオーナー | 2026-07-06 | [x] |
| 未決定6項目 / Open items resolved | プロジェクトオーナー | 2026-07-06 | [x] |
