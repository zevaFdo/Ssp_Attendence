# 休日カレンダー・WFH 固定曜日 — 要件定義
# Company Calendar & Default WFH Weekday — Requirements

> **Spec ID:** `specs/009-company-calendar-wfh-profile/`
> **Related Issue:** [#9](https://github.com/zevaFdo/Ssp_Attendence/issues/9)
> **Status:** approved (requirements)
> **Approved by:** プロジェクトオーナー — 2026-07-07
> **Source:** `docs/requirements/owner-brief-v6.md`, `memory/constitution.md` v1.2.0
> **Prerequisite:** Phase 1 complete (`specs/008`, Issue #8 merged)

---

## 概要 | Overview

**日本語:** オーナー要件 v6 Phase 2 として、**会社休日カレンダー**（土日・祝日・会社特別休日）のデータモデルと管理者保守 UI、および **HR 割当の WFH 固定曜日**（従業員プロファイル）を実装する。休日は**操作ブロックしない**（表示・参照のみ）。WFH 固定曜日の**変更申請フロー**および固定曜日での即時ボード反映は後続 spec に委譲する。

**English:** Phase 2 per owner v6: implement **company holiday calendar** data model and admin maintenance UI (weekends, national holidays, company special holidays), plus **HR-assigned default WFH weekday** on employee profiles. Holidays do **not** block operations (display/reference only). WFH **change-request workflow** and immediate board update on default WFH day are deferred to later specs.

---

## スコープ | Scope

### 含む / In scope

**日本語:**

1. **会社特別休日**の永続化とシード  
   - 年末年始 **12/29–1/4**、お盆 **8/14–8/16**（毎年繰り返し）
2. **祝日（日本）**の参照 — 日付判定 API/ヘルパー（取得方式は `technical.md`）
3. **土日**の判定（永続化不要、計算でよい）
4. **管理者向け休日カレンダー保守 UI**（一覧・追加・編集・削除；会社独自休日）
5. **`profiles` への WFH 固定曜日** — HR/管理者が従業員ごとに割当（従業員自己変更不可）
6. **従業員管理 UI**（`/employees`）に WFH 固定曜日の表示・編集（`hr_supervisor` / `admin` のみ）
7. **RLS** — 新テーブル必須；既存 `profiles` 列追加時もポリシー更新
8. **i18n** — `ja.json` + `en.json`
9. **統合テスト**（実 Supabase）— 休日 CRUD 権限、WFH 割当権限、シード検証
10. **参照ヘルパー** — `isHoliday(date)`、`getDefaultWfhWeekday(userId)` 等（後続 Phase 3–5 が利用）

**English:**

1. Persist and seed **company special holidays** (Dec 29–Jan 4, Aug 14–16, yearly recurrence)
2. **Japan national holidays** reference — date helper (source in `technical.md`)
3. **Weekend** detection (computed, not stored)
4. **Admin holiday calendar UI** (list/add/edit/delete custom company holidays)
5. **`profiles` default WFH weekday** — HR/admin assigns per employee (employees cannot self-edit)
6. **Employees page** — display/edit WFH weekday (`hr_supervisor` / `admin` only)
7. **RLS** on new tables; update policies for new `profiles` column
8. **i18n** both locales
9. **Integration tests** on real Supabase
10. **Reference helpers** for later phases

### 含まない / Out of scope

**日本語:**

| 項目 | 委譲先 |
|------|--------|
| WFH 固定曜日**変更申請**（翌週のみ / 恒久） | `specs/011`（申請種別） |
| 固定曜日 WFH の**即時ボード更新**（承認不要） | `specs/010`（勤怠ステータス） |
| 固定曜日外 WFH の承認・スケジュール連動 | `specs/011` / `specs/012` |
| 休日・WFH による**操作ブロック** | 要件上「しない」— 実装しない |
| 有給・管理者全員ステータス変更 | `specs/013` / `specs/014` |
| 毎時ジョブ・未打刻自動 `late` | `specs/010` / `specs/012` |

**English:** WFH change requests → `011`; immediate default-WFH board update → `010`; non-default WFH approval/schedule → `011`/`012`; no holiday blocking; paid leave / admin status → `013`/`014`; auto late scheduler → `010`/`012`.

---

## 業務ルール | Business Rules

### 休日 | Holidays

| 種別 / Type | 例 / Example | 保守 / Maintenance |
|-------------|--------------|-------------------|
| 土日 / Weekend | Sat, Sun | 計算 / computed |
| 祝日 / National (JP) | 元日、成人の日等 | ライブラリ or マスタ（`technical.md`） |
| 会社特別休日 / Company special | 12/29–1/4, 8/14–8/16 | マイグレーションシード + 管理者編集可 |
| 会社独自休日 / Ad-hoc company | 創立記念日等 | 管理者 UI で追加 |

**日本語:** 休日中も従業員は出退勤・申請・ステータス操作を**ブロックされない**（オーナー要件 v6）。

**English:** Holidays do **not** block employee operations.

### WFH 固定曜日 | Default WFH weekday

| ルール / Rule | 内容 / Detail |
|---------------|---------------|
| 割当権 / Who assigns | `hr_supervisor`, `admin` のみ |
| 自己変更 / Self-service | **不可** — 従業員 UI に編集欄を出さない |
| 未割当 / Unassigned | `NULL` 可 — 「固定 WFH 曜日なし」 |
| 曜日値 / Weekday value | **月=0 … 金=4**（平日のみ、Asia/Tokyo）— 土日は割当不可 |
| 翌週のみ / Next week only | **暦週（月〜日）**（Phase 0 確定 #6）— **本 spec では申請フロー未実装** |
| 恒久変更 / Permanent | 申請承認後 HR が `profiles` 更新 — **`specs/011` 以降** |

**English:** HR/admin assign a **weekday** only (Mon=0…Fri=4, Tokyo); Sat/Sun not allowed; nullable; no employee self-edit; temporary/permanent change requests deferred to spec 011.

### 権限 | Authorization

| 操作 / Action | `admin` | `hr_supervisor` | `section_head` | その他 |
|---------------|---------|-----------------|----------------|--------|
| 休日カレンダー CRUD | ✅ | ✅ | ❌ | ❌ |
| WFH 固定曜日 割当・変更 | ✅ | ✅ | ❌ | ❌ |
| 休日・WFH 参照（読取） | ✅ | ✅ | ✅ | ✅（認証済み） |

**English:** Holiday CRUD and WFH assignment: admin + HR only. Read access: all authenticated users.

---

## ユーザーストーリー | User Stories

### US-1 管理者が特別休日を確認する | Admin views special holidays

**日本語:** 管理者が休日カレンダー画面で、シード済みの年末年始・お盆および祝日を確認できる。

**English:** Admin opens holiday calendar and sees seeded year-end, Obon, and national holidays.

### US-2 管理者が会社独自休日を追加する | Admin adds custom holiday

**日本語:** HR/管理者が単日または期間の会社休日を追加・編集・削除できる。理由・名称を付与できる。

**English:** HR/admin can add/edit/delete ad-hoc company holidays with name/label.

### US-3 HR が WFH 固定曜日を割当する | HR assigns default WFH weekday

**日本語:** HR が従業員一覧で各従業員の WFH 固定曜日（例: 水曜）を設定・変更できる。従業員本人は変更できない。

**English:** HR sets/changes each employee's default WFH weekday on `/employees`; employees cannot edit.

### US-4 従業員が自分の WFH 固定曜日を確認する | Employee views assigned weekday

**日本語:** 従業員は自分のプロファイルまたは勤怠画面で、HR が割当した WFH 固定曜日を**参照のみ**で確認できる（Phase 2 最小: 従業員一覧に自分の行が見える場合は表示で可；専用マイページは任意）。

**English:** Employee can read-only see their assigned WFH weekday (minimal: visible where profile is shown).

---

## 受け入れ条件 | Acceptance Criteria

**日本語:**

1. マイグレーション後、**12/29–1/4** と **8/14–8/16** が任意の年で `isHoliday()` が true を返す（シード or ルール）
2. 土日は `isHoliday()` が true（祝日・特別休日と合わせて「休日」集合として参照可能）
3. 日本の祝日が `isHoliday()` または同等 API で判定できる（方式は `technical.md`）
4. `admin` / `hr_supervisor` のみが会社独自休日を CRUD でき、`employee` は拒否される（RLS + Server Action）
5. `profiles.default_wfh_weekday`（仮称）が NULL または **0–4（月〜金）** の整数のみ許容；土日は不可
6. `hr_supervisor` / `admin` のみが他従業員の WFH 固定曜日を更新できる；`employee` 自己更新は RLS/Action で拒否
7. `/employees`（または同等管理画面）に WFH 固定曜日列と HR 編集 UI がある（375px で操作可能）
8. 休日カレンダー管理 UI が存在し、モバイル 375px で一覧・追加が可能
9. 休日 CRUD・WFH 割当の統合テストが実 Supabase で PASS
10. 新 UI 文言が `ja.json` と `en.json` の両方にある
11. 禁止リネーム一覧（`profiles`, `attendance`, ロール値等）に違反しない
12. **休日・WFH 設定が勤怠ボードの承認要否を Phase 2 時点で変更しない**（挙動変更は `010`/`011`）

**English:**

1. After migration, Dec 29–Jan 4 and Aug 14–16 return true from `isHoliday()` for any year
2. Weekends included in holiday detection
3. Japan national holidays detectable (method in `technical.md`)
4. Only admin/HR CRUD custom holidays (RLS + actions)
5. `default_wfh_weekday` nullable or **0–4 (Mon–Fri) only**; Sat/Sun rejected
6. Only admin/HR update others' WFH weekday; employees blocked from self-update
7. Employees admin UI shows/edits WFH weekday at 375px
8. Holiday admin UI exists, usable at 375px
9. Integration tests pass on real Supabase
10. i18n in both locale files
11. No forbidden renames
12. Phase 2 does not change board approval rules (deferred to 010/011)

---

## データ概要（要件レベル）| Data Overview (requirements level)

> 詳細スキーマは `technical.md` で確定。テーブル名は `technical.md` 承認後に確定する。

**日本語:**

| 概念 | 概要 |
|------|------|
| 会社休日マスタ | 日付（または期間）、名称、種別（`special` / `custom`）、任意メモ |
| `profiles` 拡張 | `default_wfh_weekday smallint null`（0=月 … 4=金、平日のみ） |
| 監査 | `created_at` / `updated_at`；変更者 ID は `technical.md` で検討 |

**English:** Company holiday master; `profiles.default_wfh_weekday`; audit columns per technical spec.

---

## UI 概要 | UI Overview

| 画面 / Screen | パス（案） | ロール |
|---------------|-----------|--------|
| 休日カレンダー管理 | `/admin/holidays` または `/settings/holidays` | admin, hr_supervisor |
| 従業員 WFH 割当 | 既存 `/employees` テーブル拡張 | admin, hr_supervisor |
| 休日参照（任意） | ダッシュボードまたはカレンダー Widget | 全員 read-only |

**日本語:** モバイルファースト（憲法 IX）。タッチターゲット最小 44×44px。カスタム CSS は `globals.css` のみ。

**English:** Mobile-first; min 44×44px touch targets; custom CSS only in `globals.css`.

---

## リスク | Risks

| リスク / Risk | 緩和 / Mitigation |
|---------------|-------------------|
| 祝日データの更新・閏年 | `technical.md` で JP 祝日ソース（npm パッケージ vs DB マスタ）を選定 |
| 特別休日の年跨ぎ（12/29–1/4） | 期間型 or 年次ルールでシード；統合テストで 12/31・1/1 を検証 |
| Phase 3 がヘルパー API に依存 | 公開関数のシグネチャを `technical.md` で固定 |
| `profiles` 列追加と RLS | マイグレーション + `database.types.ts` + ポリシーを同一 PR |
| Issue #7 憲法 docs が main に含まれる | 本 spec は Issue #9 のみ；ブランチは `main` から |

---

## テスト方針（要件）| Test Strategy (requirements)

**日本語:** 憲法 II に従い、実装前に統合テストを RED で追加する。

| 層 | 内容 |
|----|------|
| Unit | 休日判定ヘルパー（土日・特別休日・祝日モック） |
| Integration | RLS: 休日 CRUD 権限；WFH 割当権限；シード件数 |
| E2E | HR が従業員 WFH 曜日を変更；管理者が休日追加（Playwright、375px 手動確認） |

**English:** Test-first; unit for helpers; integration for RLS/seeds; E2E for HR flows.

---

## 関連文書 | Related Documents

- `docs/requirements/owner-brief-v6.md` — §会社ルール、§WFH 固定曜日
- `memory/constitution.md` v1.2.0 — ドメイン仕様、ギャップ表 Phase 2
- `docs/handover/agent-handover-v6-requirements.md` — Phase 2 計画
- `docs/onboarding/issue-bodies/v6/009-calendar-wfh.md`
- `specs/008-approval-workflow-reorder/` — 承認フロー（WFH 変更申請で再利用）

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | プロジェクトオーナー | 2026-07-07 | [x] |

**English:** Do not proceed to `technical.md` until requirements row is signed off.

---

## 次のステップ | Next Steps (after approval)

1. オーナーが本 `requirements.md` を承認
2. `technical.md` 起草（スキーマ・祝日ソース・API・RLS 詳細）
3. オーナーが `technical.md` を承認
4. `implementation.md` 起草・承認
5. `feature/issue-9-company-calendar-wfh` ブランチ — テスト RED → 実装 GREEN
