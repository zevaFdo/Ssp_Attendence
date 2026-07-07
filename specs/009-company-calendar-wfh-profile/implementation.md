# 休日カレンダー・WFH 固定曜日 — 実装計画
# Company Calendar & Default WFH Weekday — Implementation Plan

> **Spec ID:** `specs/009-company-calendar-wfh-profile/`
> **Prerequisite:** `technical.md` approved (2026-07-07)
> **Related Issue:** [#9](https://github.com/zevaFdo/Ssp_Attendence/issues/9)
> **Status:** in progress — branch `feature/issue-9-company-calendar-wfh`

---

## ブランチ | Branch

**日本語:** `feature/issue-9-company-calendar-wfh`（`main` から分岐）

**English:** `feature/issue-9-company-calendar-wfh` (branch from `main`)

---

## 実装順序（テストファースト）| Implementation Order (Test-First)

1. `test: 休日・WFH 固定曜日の単体・統合テスト (RED)` — commit
2. `npm run test` / `npm run test:unit` / `npm run test:integration` → 失敗確認
3. `0007_company_calendar_wfh.sql` + `@holiday-jp/holiday_jp` + calendar ヘルパー → `feat: 休日カレンダーと WFH 固定曜日 (GREEN)` — commit
4. Server Actions + UI + i18n + ナビリンク → 同一または追 commit
5. E2E `tests/e2e/company-calendar-wfh.spec.ts` → 全 PASS
6. 375px 手動確認 → PR（`closes #9`）
7. 必要なら `refactor:` commit

---

## タスク一覧 | Task Checklist

### テスト（RED 先行）| Tests (RED first)

- [ ] 単体: `tests/unit/calendar/company-special.test.ts`
- [ ] 単体: `tests/unit/calendar/is-holiday.test.ts`
- [ ] 単体: `tests/unit/calendar/wfh-weekday.test.ts`
- [ ] 単体: `tests/unit/validations/company-holiday.test.ts`
- [ ] 単体: `tests/unit/validations/wfh-weekday.test.ts`
- [ ] 統合: `tests/integration/company-calendar-wfh.test.ts`（実 Supabase）

### DB・型 | DB & types

- [ ] マイグレーション: `supabase/migrations/0007_company_calendar_wfh.sql`
- [ ] リモート Supabase へマイグレーション適用
- [ ] 型: `src/types/database.types.ts`, `src/types/app.ts`

### ライブラリ | Library

- [ ] `npm install @holiday-jp/holiday_jp`
- [ ] `src/lib/calendar/timezone.ts`
- [ ] `src/lib/calendar/company-special.ts`
- [ ] `src/lib/calendar/jp-national.ts`
- [ ] `src/lib/calendar/company-custom.ts`
- [ ] `src/lib/calendar/is-holiday.ts`
- [ ] `src/lib/calendar/wfh-weekday.ts`

### 認可・バリデーション | Auth & validation

- [ ] `src/lib/auth/permissions.ts` — `canManageCompanyHolidays`, `canAssignDefaultWfhWeekday`
- [ ] `src/lib/validations/company-holidays.ts`
- [ ] `src/lib/validations/wfh-weekday.ts`

### Server Actions

- [ ] `src/actions/company-holidays.ts` — create / update / delete
- [ ] `src/actions/employees.ts` — `updateEmployeeWfhWeekday`（または既存ファイルに追加）

### UI

- [ ] `src/app/(dashboard)/settings/holidays/page.tsx`
- [ ] 休日 CRUD コンポーネント（Dialog、一覧）
- [ ] `EmployeeTable` — WFH 固定曜日列（HR/admin 編集、section_head read-only）
- [ ] サイドバー / `MobileBottomNav` — HR/admin のみ「休日」リンク
- [ ] ダッシュボード or プロファイル — 自分の WFH 固定曜日 read-only 表示

### i18n

- [ ] `src/messages/ja.json` — `holidays.*`, `weekdays.*`, `employees.table.wfhWeekday`
- [ ] `src/messages/en.json` — 同上

### E2E・手動 | E2E & manual

- [ ] `tests/e2e/company-calendar-wfh.spec.ts`
- [ ] Playwright auth setup 再利用（HR ユーザー）
- [ ] 375px 手動確認（休日追加、WFH 割当）

### PR

- [ ] PR 本文（憲法チェックリスト、`closes #9`）

---

## コミット分割（案）| Suggested commits

| 順 | メッセージ（日本語） | 内容 |
|----|----------------------|------|
| 1 | `test: 休日・WFH 固定曜日のテスト追加 (RED)` | unit + integration |
| 2 | `feat: 休日カレンダーと WFH 固定曜日の DB・ヘルパー (GREEN)` | migration, calendar lib, permissions |
| 3 | `feat: 休日管理 UI と WFH 割当 UI` | pages, actions, i18n, nav |
| 4 | `test: 休日・WFH の Playwright E2E を追加` | e2e spec |

---

## リスク・依存 | Risks & Dependencies

| リスク / Risk | 対策 / Mitigation |
|---------------|-------------------|
| `@holiday-jp/holiday_jp` API 変更 | minor pin；jp-national ユニットテスト |
| `tg_profiles_lock_fields` 回帰 | 統合テストで section_head / employee 更新を検証 |
| 12/29–1/4 年跨ぎ | company-special 単体テスト 5 日付 |
| CI 実 Supabase なし | `hasSupabaseTestEnv()` skip |
| Phase 3 ヘルパー契約 | `is-holiday.ts` / `wfh-weekday.ts` export を technical と一致 |

---

## 完了定義 | Definition of Done

- [ ] `requirements.md` 受け入れ条件 1–12 すべて PASS
- [ ] 単体 + 統合 + E2E PASS（ローカル実 Supabase）
- [ ] 375px 手動確認済み
- [ ] マイグレーション remote 適用済み
- [ ] 憲法 PR チェックリスト完了
- [ ] Issue #9 クローズ

---

## スコープ外（再確認）| Out of scope (recheck)

- WFH 変更申請（翌週 / 恒久）→ `specs/011`
- 固定曜日 WFH の即時ボード反映 → `specs/010`
- 休日による操作ブロック → 実装しない

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| implementation | プロジェクトオーナー | 2026-07-07 | [x] |

**English:** Do not start RED commits until this row is signed off.

---

## 次のステップ（承認後）| Next Steps (after approval)

1. `git checkout -b feature/issue-9-company-calendar-wfh`
2. RED テスト commit → 失敗確認
3. GREEN 実装 → テスト PASS
4. E2E + 375px → PR
