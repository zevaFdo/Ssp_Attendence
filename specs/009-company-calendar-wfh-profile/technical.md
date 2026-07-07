# 休日カレンダー・WFH 固定曜日 — 技術設計
# Company Calendar & Default WFH Weekday — Technical Design

> **Spec ID:** `specs/009-company-calendar-wfh-profile/`
> **Prerequisite:** `requirements.md` approved (2026-07-07)
> **Related Issue:** [#9](https://github.com/zevaFdo/Ssp_Attendence/issues/9)
> **Status:** approved
> **Approved by:** プロジェクトオーナー — 2026-07-07
> **Next migration:** `supabase/migrations/0007_company_calendar_wfh.sql`

---

## アーキテクチャ概要 | Architecture Overview

**日本語:** 休日判定は **3 ソース** を合成する Server 専用ヘルパーに集約する。(1) 土日は `date-fns` + `Asia/Tokyo` で計算、(2) 会社特別休日（12/29–1/4、8/14–8/16）は**コード定数**（毎年繰り返し）、(3) 日本祝日は npm `@holiday-jp/holiday_jp`（サーバーのみ）、(4) 管理者追加の **会社独自休日** は新テーブル `company_holidays` に永続化。WFH 固定曜日は `profiles.default_wfh_weekday`（**0=月 … 4=金、平日のみ**）に追加し、HR/管理者のみ更新可（DB トリガー + Server Action 二重ガード）。

**English:** Holiday detection merges four sources in server-only helpers: weekends (computed, Tokyo TZ), company special ranges (code constants), Japan national holidays (`@holiday-jp/holiday_jp`), and admin CRUD rows in `company_holidays`. Default WFH weekday lives on `profiles.default_wfh_weekday` (**0=Mon…4=Fri, weekdays only**), HR/admin-only updates via trigger + Server Actions.

### 影響レイヤー | Affected layers

| レイヤー / Layer | 変更 / Change |
|------------------|---------------|
| DB migration | `company_holidays` テーブル、`profiles.default_wfh_weekday`、`tg_profiles_lock_fields` 拡張 |
| RLS | `company_holidays` 新規ポリシー |
| Server Actions | 休日 CRUD、WFH 曜日割当 |
| UI | `/settings/holidays`、 `/employees` テーブル拡張 |
| i18n | 休日・曜日ラベル |
| Types | `database.types.ts` 手動追記 + `npm run types:gen` |
| Lib | `src/lib/calendar/*` ヘルパー（後続 Phase 3–5 向け公開 API） |
| Tests | Unit（ヘルパー）+ Integration（RLS・シード）+ E2E |

---

## データモデル | Data Model

### 新テーブル `company_holidays`

**用途:** 管理者が追加する **会社独自休日**（創立記念日等）のみ。特別休日（年末年始・お盆）は DB に保存しない（コード定数）。

```sql
create table public.company_holidays (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) >= 1),
  holiday_date date not null,
  note         text,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (holiday_date, name)
);

create index idx_company_holidays_date
  on public.company_holidays (holiday_date);
```

| カラム / Column | 型 / Type | 説明 / Description |
|-----------------|-----------|-------------------|
| `name` | `text` | 表示名（i18n キーではなく DB 値；管理 UI で入力） |
| `holiday_date` | `date` | 単日休日（Asia/Tokyo 暦日） |
| `note` | `text` nullable | 任意メモ |
| `created_by` | `uuid` nullable | 作成者 |

**English:** One row per ad-hoc company holiday date. Special recurring ranges are not stored here.

### `profiles` 拡張

```sql
alter table public.profiles
  add column if not exists default_wfh_weekday smallint
  check (
    default_wfh_weekday is null
    or (default_wfh_weekday >= 0 and default_wfh_weekday <= 4)
  );

comment on column public.profiles.default_wfh_weekday is
  '0=Mon … 4=Fri (weekdays only, Asia/Tokyo). HR/admin assigned only.';
```

| 値 / Value | 曜日 / Weekday |
|------------|----------------|
| 0 | 月 / Monday |
| 1 | 火 / Tuesday |
| 2 | 水 / Wednesday |
| 3 | 木 / Thursday |
| 4 | 金 / Friday |
| `NULL` | 未割当 / Unassigned |

**日本語:** 土日は WFH 固定曜日として**割当不可**（平日リモート勤務の業務ルール）。

**English:** Saturday and Sunday are **not valid** WFH assignment values — default WFH applies to a **weekday** only.

---

## 休日判定 | Holiday Detection

### モジュール構成 | Module layout

```
src/lib/calendar/
├── timezone.ts           # Asia/Tokyo 日付正規化
├── company-special.ts    # 12/29–1/4, 8/14–8/16（繰り返し）
├── jp-national.ts        # @holiday-jp/holiday_jp ラッパー
├── company-custom.ts     # company_holidays DB 読取（Server）
├── is-holiday.ts         # 公開 API: isHoliday(date)
└── wfh-weekday.ts        # getDefaultWfhWeekday, isDefaultWfhDay
```

### `isHoliday(date: string | Date): Promise<boolean>`

**評価順 / Evaluation order**（いずれか true なら休日）:

1. **Weekend** — `getDay()` in Tokyo: Saturday or Sunday
2. **Company special** — `isCompanySpecialHoliday(localDate)`:
   - Dec 29 – Jan 4 (inclusive, year-spanning)
   - Aug 14 – Aug 16 (inclusive)
3. **Japan national** — `isJapanNationalHoliday(localDate)` via `@holiday-jp/holiday_jp`
4. **Custom DB** — `exists in company_holidays where holiday_date = localDate`

**日本語:** いずれも **参照専用**。勤怠操作ブロックには使用しない（Phase 2）。

**English:** All read-only; no operation blocking in Phase 2.

### 依存パッケージ | Dependency

```json
"@holiday-jp/holiday_jp": "^2.x"
```

- **サーバー専用** — Client Component から import 禁止
- ユニットテストでは jp-national をモック可

---

## RLS | Row Level Security

### `company_holidays`

```sql
alter table public.company_holidays enable row level security;

create policy "company_holidays_select_authenticated"
  on public.company_holidays for select to authenticated using (true);

create policy "company_holidays_hr_admin_insert"
  on public.company_holidays for insert to authenticated
  with check (public.current_user_role() in ('admin', 'hr_supervisor'));

create policy "company_holidays_hr_admin_update"
  on public.company_holidays for update to authenticated
  using (public.current_user_role() in ('admin', 'hr_supervisor'))
  with check (public.current_user_role() in ('admin', 'hr_supervisor'));

create policy "company_holidays_hr_admin_delete"
  on public.company_holidays for delete to authenticated
  using (public.current_user_role() in ('admin', 'hr_supervisor'));
```

### `profiles.default_wfh_weekday` — トリガー拡張

`tg_profiles_lock_fields` を更新:

```sql
-- admin: 変更可（既存 early return）
-- hr_supervisor: default_wfh_weekday のみ他者更新可（role/section 既存ルール維持）
-- section_head: default_wfh_weekday 変更不可（old 値に戻す）
-- employee 自己更新: default_wfh_weekday 変更不可
if new.default_wfh_weekday is distinct from old.default_wfh_weekday then
  if caller not in ('admin', 'hr_supervisor') then
    new.default_wfh_weekday := old.default_wfh_weekday;
  end if;
end if;
```

**English:** Only `admin` and `hr_supervisor` may change `default_wfh_weekday`; `section_head` registrars cannot.

---

## 認可ヘルパー | Permission helpers

`src/lib/auth/permissions.ts` に追加:

```typescript
export function canManageCompanyHolidays(role: UserRole | null | undefined) {
  return role === "admin" || role === "hr_supervisor";
}

export function canAssignDefaultWfhWeekday(role: UserRole | null | undefined) {
  return role === "admin" || role === "hr_supervisor";
}
```

---

## Server Actions

| Action | ファイル | 認可 | 概要 |
|--------|----------|------|------|
| `createCompanyHoliday` | `src/actions/company-holidays.ts` | `canManageCompanyHolidays` | 単日追加 |
| `updateCompanyHoliday` | 同上 | 同上 | 名称・日付・メモ |
| `deleteCompanyHoliday` | 同上 | 同上 | 削除 |
| `updateEmployeeWfhWeekday` | `src/actions/employees.ts` | `canAssignDefaultWfhWeekday` | `profileId` + `0–4` or `null` |

**バリデーション（Zod）:**

```typescript
// companyHolidaySchema
{ name: string min 1 max 100, holiday_date: YYYY-MM-DD, note?: string max 500 }

// wfhWeekdaySchema
{ profileId: uuid, weekday: z.number().int().min(0).max(4).nullable() }
```

- `revalidatePath("/settings/holidays")`, `revalidatePath("/employees")`
- エラーは `getTranslations("errors")` — 既存パターン

---

## UI 設計 | UI Design

### 休日管理 `/settings/holidays`

| セクション | 内容 | 編集 |
|------------|------|------|
| 会社特別休日 | 12/29–1/4、8/14–8/16（説明カード） | 読取専用 |
| 祝日（今年） |  nacional 一覧（月次グループ） | 読取専用 |
| 会社独自休日 | `company_holidays` テーブル | CRUD（Dialog 追加） |

- ルート: `src/app/(dashboard)/settings/holidays/page.tsx`
- レイアウト: 既存 dashboard；サイドバー/ボトムナビに HR/admin のみリンク
- モバイル 375px: カードリスト + FAB または上部「追加」ボタン（min-h-11）

### 従業員 WFH 割当 `/employees`

- `EmployeeTable` に列 **WFH 固定曜日** 追加
- HR/admin のみ: 行内 `Select` または Edit ダイアログ（**月〜金** + 「未割当」）
- `section_head` は `/employees` 閲覧可だが **WFH 列は編集不可**（read-only 表示 or 列非表示 — **read-only 表示**を採用し透明性確保）

### 従業員自己参照

- ダッシュボードまたはプロファイル概要に「WFH 固定曜日: 水曜」read-only（`default_wfh_weekday` が NULL なら「未割当」）

---

## i18n キー（案）| i18n keys (draft)

| Namespace | Keys |
|-----------|------|
| `holidays.*` | `title`, `specialTitle`, `nationalTitle`, `customTitle`, `add`, `edit`, `delete`, `name`, `date`, `note`, `empty` |
| `weekdays.*` | `mon`…`fri`, `unassigned` |
| `employees.table` | `wfhWeekday` |
| `employees.wfh` | `assign`, `saved` |

両方 `ja.json` / `en.json` に追加。

---

## テスト設計 | Test Design

### Unit — `tests/unit/calendar/`

| ファイル | 内容 |
|----------|------|
| `company-special.test.ts` | 12/31, 1/1, 8/15 true；12/28, 8/13 false |
| `is-holiday.test.ts` | 土日、特別休日、祝日モック、custom モック |
| `wfh-weekday.test.ts` | `isDefaultWfhDay(user, date)` ロジック |

### Integration — `tests/integration/company-calendar-wfh.test.ts`

| ケース | 検証 |
|--------|------|
| HR inserts custom holiday | service role or authenticated HR client |
| `employee` insert denied | RLS error |
| HR updates `default_wfh_weekday` on other profile | success |
| Employee self-update `default_wfh_weekday` | reverted / error |
| `section_head` update WFH on other | reverted |

`hasSupabaseTestEnv()` パターン — CI プレースホルダー時 skip。

### E2E — `tests/e2e/company-calendar-wfh.spec.ts`

- Auth setup: `hr1@demo.com`
- HR adds custom holiday → listed
- HR changes employee WFH weekday on `/employees`
- 375px project 実行

---

## マイグレーション手順 | Migration

**ファイル:** `0007_company_calendar_wfh.sql`

1. `company_holidays` 作成 + RLS + インデックス
2. `profiles.default_wfh_weekday` 追加 + CHECK
3. `tg_profiles_lock_fields` 置換（WFH 列ガード）
4. `tg_set_updated_at` トリガー on `company_holidays`
5. （任意）デモ用 custom 休日シードなし — 特別休日はコードのみ

**ロールバック:** 列 drop、テーブル drop、旧トリガー関数を `0006` 時点から復元（`implementation.md` に手順）

---

## 後続 Phase との契約 | Contract for later phases

| 公開関数 | 利用者 |
|----------|--------|
| `isHoliday(date)` | `010` ボード表示、`012` スケジューラ |
| `getDefaultWfhWeekday(userId)` | `010` WFH 即時判定 |
| `isDefaultWfhDay(userId, date)` | `010` — weekday match in Tokyo |

**変更申請・一時翌週 WFH** は `011` で `wfh_overrides` 等を追加予定（本 spec では列を追加しない）。

---

## セキュリティ | Security

- `@holiday-jp/holiday_jp` は Server Action / RSC のみ
- 休日名・メモは React テキストノードで表示（XSS 既存パターン）
- `created_by` に PII ログ出力しない
- Service Role は E2E クリーンアップ・seed のみ（既存パターン）

---

## リスクと緩和 | Risks

| リスク | 緩和 |
|--------|------|
| 12/29–1/4 の年跨ぎ | `company-special.ts` に単体テスト；12/29, 12/31, 1/1, 1/4, 1/5 |
| 祝日パッケージメンテ | pin minor version；ユニットテスト固定日 |
| `section_head` が registrars_update で WFH を触る | トリガーで列ロック |
| EmployeeTable が client — WFH 更新 | Server Action + `router.refresh()`（008 パターン） |

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| technical | プロジェクトオーナー | 2026-07-07 | [x] |

**English:** Do not write `implementation.md` or code until this row is signed off.

---

## 次のステップ | Next Steps (after approval)

1. `implementation.md` 起草（タスク分解・commit 順）
2. ブランチ `feature/issue-9-company-calendar-wfh`
3. RED: unit + integration tests
4. GREEN: migration + actions + UI + i18n
5. E2E + 375px 手動 → PR `closes #9`
