# Attendance Web 開発憲法
# Attendance Web Development Constitution

> **Primary language / 主言語:** 日本語 (Japanese)
> **Secondary language / 副言語:** English
> **Chat responses / チャット応答:** English (see `.cursorrules`)
> All project documents follow this bilingual convention.

---

## 中核原則 | Core Principles

### I. 仕様駆動開発 | Spec-Driven Development

**日本語:** すべての機能は仕様書作成から開始する；仕様書は要件・技術設計・実装計画の3段階で構成；実装前の承認プロセス必須；変更時は仕様書の更新が前提；本憲法の「ドメイン仕様」セクションが最上位の業務要件である

**English:** All features start with a written spec in three stages (requirements, technical design, implementation plan). Approval is required before implementation. Spec updates are mandatory when requirements change. The Domain Specification section of this constitution is the highest business authority.

### II. テストファースト（非交渉）| Test-First (Non-Negotiable)

**日本語:** TDD必須：テスト作成 → 承認 → 失敗確認 → 実装；Red-Green-Refactorサイクル厳格実行；実装前テスト、RED段階省略は禁止；Supabase（PostgreSQL）・Server Actions・RLS は統合テストで実際の依存関係を使用；UIのみのモックは単体テストに限定

**English:** TDD is mandatory: write tests → approve → confirm RED → implement. Strict Red-Green-Refactor. Skipping RED is forbidden. Integration tests use real Supabase (PostgreSQL), Server Actions, and RLS. Mock only UI in unit tests.

### III. 統合テスト重視 | Integration Testing Priority

**日本語:** Vitest/Jest（単体）→ Server Actions / API Route（統合）→ Playwright（E2E・ブラウザ）の3層テスト戦略；契約変更・新API・RLSポリシー・DBマイグレーションは統合テスト必須；承認フロー・有給計算・申請取消はE2Eで実動作確認

**English:** Three-layer strategy: Vitest/Jest (unit) → Server Actions / API Routes (integration) → Playwright (E2E). Contract changes, new APIs, RLS policies, and migrations require integration tests. Approval flows, paid-leave calculations, and request cancellation require E2E verification.

### IV. 日本語開発環境 | Japanese Development Environment

**日本語:** UI・ドキュメント・コメント・commit 全て日本語（英語 i18n キーは `en.json` に分離）；ロケール `ja-JP`、タイムゾーン `Asia/Tokyo` 固定；日付表示は `YYYY/MM/DD`、時刻は `HH:mm`（24時間制）；有給年度は**入社日+6か月**の anniversary を起算日とする（4月年度ではない）

**English:** UI, documentation, comments, and commits are in Japanese (English UI strings live in `en.json`). Locale `ja-JP`, timezone `Asia/Tokyo`. Dates display as `YYYY/MM/DD`, times as `HH:mm` (24-hour). Paid-leave fiscal year starts on the **hire date + 6 months** anniversary (not April fiscal year).

### V. 観測可能性 | Observability

**日本語:** 構造化ログ必須；Server Actions・Teams Webhook・PDF生成・Supabase エラーは文脈付きで記録；申請ID・ユーザーID・承認段階をログに含める；本番問題追跡のため詳細ログを残す

**English:** Structured logging is mandatory. Server Actions, Teams webhooks, PDF generation, and Supabase errors must be logged with context including request ID, user ID, and approval stage.

### VI. 効率的タイムアウト（非交渉）| Efficient Timeouts (Non-Negotiable)

**日本語:** テスト環境：単一テスト最大15秒（例外なし）；本番環境：Server Action / API Route 最大10秒（超過は不具合）；Supabase Realtime・PDF生成は非同期化または進捗通知で UX を損なわない；長時間待機は時間浪費として厳禁

**English:** Test environment: max 15 seconds per test (no exceptions). Production: Server Actions / API Routes max 10 seconds. Use async or progress indicators for Realtime and PDF so UX is not blocked. Long waits are forbidden.

### VII. その場しのぎコード禁止（非交渉）| No Workarounds (Non-Negotiable)

**日本語:** テストパターンを通すためだけのコード作成厳禁；仕様の独断変更・緩和は絶対禁止；問題発生時は修正案として人間に確認必須；問題切り分けのためのテストコード打診はOK；真の原因究明と根本的解決を最優先

**English:** No code written solely to pass tests. No unilateral spec changes or relaxations. Propose fixes and get human approval. Diagnostic test probes are OK. Root-cause resolution is the priority.

### VIII. ブラウザテスト実証必須（非交渉）| Browser Verification Required (Non-Negotiable)

**日本語:** プログラム修正時は Playwright ブラウザテスト実行必須；テスト成功確認後のみ修正完了報告可能；モバイルビューポート（375px）での手動検証も必須；PWA・モバイルボトムナビ含む；テスト未実行での完了報告は憲法違反

**English:** Run Playwright on every code change. Report completion only after tests pass. Manual verification at 375px viewport is required (PWA, bottom nav included). Reporting done without tests is a constitution violation.

### IX. モバイルファースト UI 原則 | Mobile-First UI Principles

**日本語:** **レイアウト**: Tailwind CSS + Radix UI プリミティブ；カスタム CSS は `globals.css` に限定；**ナビゲーション**: デスクトップはサイドバー、モバイルはボトムナビ（`MobileBottomNav`）；**タッチターゲット**: 最小 44×44px；**申請フォーム**: 1画面1目的、入力項目は縦積み

**English:** Layout: Tailwind CSS + Radix UI. Custom CSS only in `globals.css`. Navigation: sidebar on desktop, `MobileBottomNav` on mobile. Min touch target 44×44px. Request forms: one purpose per screen, vertical inputs.

### X. Supabase RLS セキュリティ原則 | Supabase RLS Security

**日本語:** すべての業務テーブルに RLS；従業員は自分のデータのみ、承認者は担当範囲のみ；承認カラムは DB トリガーでロール別更新を強制；`SUPABASE_SERVICE_ROLE_KEY` はサーバー専用；RLS 変更はマイグレーション + 統合テスト + ポリシー更新がセット

**English:** RLS on all business tables. Employees see own data only; approvers see their scope only. Approval columns guarded by DB triggers. Service role key is server-only. RLS changes require migration + integration tests + policy updates together.

### XI. 承認ワークフロー原則 | Approval Workflow Principles

**日本語:** **承認順序**: 所属上長（`section_head`）→ 人事（`hr_supervisor`）の2段階承認；却下時は `rejection_reason` 必須；DB トリガーで in-app 通知、Teams Adaptive Card で外部通知；両段階承認完了後に PDF 自動生成・Storage 保存；承認前は申請者が取消・内容変更可能

**English:** Two-stage approval: Section Head (`section_head`) → HR (`hr_supervisor`). Rejection requires `rejection_reason`. In-app notifications via DB triggers; Teams Adaptive Cards for external notify. PDF auto-generated after full approval. Applicants may cancel or edit before approval.

### XII. 有給管理原則 | Paid Leave Management Principles

**日本語:** 全従業員が自分の有給残日数・取得日数を確認可能；`admin` は全員の有給状況を確認可能；1年間で5日未満取得の従業員に年度末2か月前から警告；有給選択時は残日数と連動検証；付与・消化・修正は `paid_leave_ledger`（または同等）に履歴記録

**English:** All employees view own paid-leave balance and usage. `admin` views everyone's status. Warn employees with fewer than 5 days taken, starting 2 months before fiscal year-end. Paid-leave selections validate against balance. Grant, usage, and corrections are audited in `paid_leave_ledger` (or equivalent).

---

## ドメイン仕様（業務要件）| Domain Specification (Business Requirements)

### 会社勤務ルール | Company Work Rules

| 項目 / Item | 仕様 / Specification |
|-------------|---------------------|
| **始業・終業 / Hours** | 09:00–17:30 |
| **昼食 / Lunch** | 通常 12:00–13:00。この時間外のみ Lunch ステータス可 / Standard 12:00–13:00; Lunch status only outside this window |
| **休日 / Holidays** | 土日・祝日・会社特別休日（12/29–1/4、8/14–8/16）/ Sat/Sun, national holidays, company special holidays |
| **休日操作 / Holiday ops** | ブロックしない / No operation blocking on holidays |

### 申請フォーム | Request Form

| 項目 / Field | 仕様 / Specification |
|------|------|
| **申請種別 / Type** | 休暇・遅刻・外出（公務/私用）・WFH（固定曜日外）等 / Leave, Late, OOO (official/private), WFH (non-default day), etc. |
| **日付（休暇）/ Leave dates** | 終日 / 午前短時間休（09:00–14:00）/ 午後短時間休（13:00–17:30）、または日付 From〜To / Full, AM short (09:00–14:00), PM short (13:00–17:30), or From–To |
| **日付（遅刻・外出）/ Time-based** | 単日 + 時刻 From〜To（`HH:mm`）/ Single date + time From–To |
| **早退 / Early leave** | **独立申請種別ではない** — Clock Out（17:30前）内で承認分岐 / **Not a standalone type** — approval branch inside Clock Out before 17:30 |
| **処理方法 / Processing** | Late・私用 OOO に紐づく補填3択（延長・有給時間休・無給休）。延長実績の記録は不要 / Compensation tied to Late/private OOO: extension, paid hours, unpaid. **No extension-hours recording** |
| **理由/備考 / Reason** | 必須（現行5文字以上）/ Required (min 5 chars currently) |
| **イベント日 / Event date** | 提出時に指定、提出後は変更不可（再申請）/ Set at submit; immutable after submit (re-apply) |

#### 申請種別と入力フィールド | Request Type Field Mapping

```
休暇 / Leave           → date_from, date_to, leave_unit (full / am_short / pm_short)
遅刻 / Late            → date, time_from, time_to, compensation (extension / paid_hours / unpaid)
外出・公務 / OOO official  → date, time_from, time_to, colleagues (max 10)
外出・私用 / OOO private   → date, time_from, time_to, compensation
WFH（固定曜日外）/ WFH      → date, reason
Clock Out 早退 / Early CO  → clock_out before 17:30 → approval branch (not separate request type)
```

#### 処理方法（Late・私用 OOO）| Compensation (Late & Private OOO)

**日本語:**
- **勤務時間延長**: Late / 私用 OOO に紐づく。独立申請不可。**延長実績の記録は不要**
- **有給時間休**: 残日数と連動検証
- **無給休**
- 休暇申請への補填3択適用可否は**確定: 付けない**（Late・私用 OOO のみ）

**English:**
- **Work-time extension:** tied to Late/private OOO only; not standalone; **no extension-hours recording**
- **Paid leave (hours):** validate against balance
- **Unpaid leave**
- Leave requests do **not** include compensation options (resolved 2026-07-06)

### WFH 固定曜日 | Default WFH Weekday

**日本語:** HR が従業員ごとに固定曜日を割当（従業員は自己変更不可）。変更は申請 → 所属上長 → HR、理由必須。「翌週のみ」（**暦週・月〜日**）または「恒久的」。

**English:** HR assigns each employee a default WFH weekday (employees cannot self-change). Changes via request → Section Head → HR with required reason: **next calendar week (Mon–Sun)** or **permanent**.

### 日次ステータス・スケジュール | Daily Status & Schedule

**日本語:**
- Present / WFH（固定曜日）/ In Meeting / Lunch（12–13外）/ OOO 公務 / Clock Out（17:30以降）は承認不要で即時ボード更新
- WFH（固定曜日外）・OOO 私用・Late・Clock Out 早退は承認後に反映（未来日はスケジュール保存）
- 承認済み未来イベントはイベント当日**再承認不要**でボード表示。**08:00–17:00 毎時**リフレッシュ
- 09:00 ちょうどに未打刻は自動で **`late`** にボード更新。理由「更新し忘れ」で HR 通知
- 承認済み未来イベントは**イベント日のみ**ボード表示（日前は非表示）。**08:00–17:00 毎時**リフレッシュ
- 遡及申請は最大 **30日** 前まで

**English:**
- Present, default-WFH, In Meeting, Lunch (outside 12–13), official OOO, Clock Out (≥17:30): no approval, immediate board update
- Non-default WFH, private OOO, Late, early Clock Out: after approval (future dates stored on schedule)
- Approved future events auto-display on **event day only** (not before). Hourly refresh **08:00–17:00**
- At **09:00** exactly, missing status auto-sets **`late`**. Reason "forgot to update" notifies HR
- Retroactive requests limited to **30 days** back

### 承認フロー | Approval Flow

```
申請者 → 所属上長（section_head）→ 人事（hr_supervisor）→ 完了（PDF）
              ↓ 却下                    ↓ 却下
         却下理由 + 通知            却下理由 + 通知

Applicant → Section Head → HR → Complete (PDF)
              ↓ reject       ↓ reject
         reason + notify  reason + notify
```

| 段階 / Stage | 担当 / Role | 操作 / Action |
|------|-----------|------|
| 第1承認 / 1st | 所属上長 / Section Head（いずれか一方 / either one） | 承認 / 却下（`rejection_reason` 必須）/ Approve / Reject (`rejection_reason` required) |
| 第2承認 / 2nd | 人事 / HR | 承認 / 却下（`rejection_reason` 必須）/ Approve / Reject (`rejection_reason` required) |
| 完了 / Done | システム / System | PDF 生成、Storage 保存、通知 / PDF, storage, notify |

**却下通知 / Rejection notify:** 所属上長却下時は申請者のみ（HR 非通知）/ Section Head rejection notifies applicant only (not HR).

> **移行注記 / Migration note:** Current implementation (`0003_workflow.sql`) uses HR → Section Head. Migrate to Section Head → HR via `specs/008` with DB columns, triggers, and UI updated together.

### 有給管理 | Paid Leave Management

| 機能 / Feature | 対象 / Audience | 仕様 / Specification |
|------|------|------|
| 残日数確認 / Balance view | 全従業員 / All employees | 付与・取得・残日数を表示 / Show grant, used, remaining |
| 全員確認 / Admin view | `admin` | 全従業員一覧・フィルタ / List and filter all employees |
| 5日義務警告 / 5-day warning | システム / System | 年度内取得 < 5日 → 2か月前から警告 / Warn 2 months before year-end |
| 申請連動 / Request link | 申請フォーム / Form | 有給選択時に残日数チェック / Validate balance on paid-leave selection |

### 申請の取消・変更 | Request Cancel & Edit

| 状態 / Status | 申請者の操作 / Applicant Action |
|------|-------------|
| 承認待ち / Pending | 取消または内容変更（承認状態リセット）/ Cancel or edit (resets approval) |
| 第1承認済・第2待ち / 1st approved | 取消申請（上長または人事が受理）/ Cancel request (Section Head or HR accepts) |
| 完全承認済 / Fully approved | 原則変更不可；人事による修正記録のみ / No changes; HR correction record only |

---

## 技術制約 | Technical Constraints

### Next.js・Supabase 環境 | Next.js & Supabase Stack

**日本語 / English (shared list):**

- **Framework:** Next.js 15 (App Router) + TypeScript + Server Actions
- **Database:** Supabase PostgreSQL
- **Auth:** Supabase Auth (email/password)
- **Realtime:** Supabase Realtime (attendance, requests, notifications)
- **Storage:** Supabase Storage (`request-documents` bucket)
- **Frontend:** Tailwind CSS + Radix UI + lucide-react + next-intl
- **Validation:** react-hook-form + zod (`src/lib/validations/`)
- **PDF:** pdfkit + NotoSansJP fonts
- **PWA:** `@ducanh2912/next-pwa`
- **External notify:** Microsoft Teams Incoming Webhook (Adaptive Card)
- **Quality:** ESLint (`eslint-config-next`), TypeScript strict

### データベース設計思想 | Database Design Philosophy

**日本語:** UUID 主キー；ENUM 型；RLS 必須；トリガーで `updated_at`・通知・カラムガード；マイグレーションは `supabase/migrations/`；変更後は `database.types.ts` 再生成；監査フィールド必須

**English:** UUID primary keys; ENUM types; RLS required; triggers for `updated_at`, notifications, column guards; migrations in `supabase/migrations/`; regenerate `database.types.ts` after schema changes; audit fields required.

### ロールと権限 | Roles & Permissions

| ロール / Role | 主な権限 / Key Permissions |
|--------|---------|
| `admin` | 全権限、ユーザー招待、有給全員確認、休日カレンダー保守 / Full access, invites, all paid-leave views, holiday calendar |
| `hr_supervisor` | 第2承認、HR 管理者、WFH 固定曜日割当、従業員登録、全勤怠閲覧・全員ステータス変更 / 2nd approver, HR admin, WFH weekday assignment, register employees, all attendance & status changes |
| `section_head` | 第1承認（いずれか一方で可）、通常管理者、従業員登録、全員ステータス変更 / 1st approver (either one), section admin, register employees, all-employee status changes |
| `team_leader` | 自チーム勤怠上書き、チームステータス / Override team attendance, team status |
| `employee` | 出退勤、申請、自分の履歴・有給 / Clock in/out, requests, own history & leave |

**管理者アカウント / Admin accounts:** 二重アカウント不要 — 同一ログインで管理操作と従業員操作を兼ねる / No duplicate accounts — single login for admin and employee actions.

---

## 開発ワークフロー | Development Workflow

### Issue 駆動開発 | Issue-Driven Development

**日本語:** GitHub Issues → 分析 → ブランチ → 修正 → テスト → PR → マージ → Issue 終了；申請種別・承認順序・有給機能は包括的テスト必須

**English:** GitHub Issues → analysis → branch → fix → test → PR → merge → close Issue. Request types, approval order, and paid-leave features require comprehensive tests.

### コードレビュー基準 | Code Review Criteria

**日本語:** 10次元品質；セキュリティ最優先（XSS・SQLi・CSRF — Server Actions + RLS）；既存パターン踏襲；スキーマ変更時はマイグレーション + 型 + RLS を同時更新

**English:** 10-dimension quality checklist; security first (XSS, SQLi, CSRF — Server Actions + RLS); follow existing patterns; schema changes require migration + types + RLS together.

### デプロイメント要件 | Deployment Requirements

**日本語:** Supabase + Next.js ホスティング；環境変数外部化；Service Role Key はサーバーのみ；マイグレーション前後テスト；本番前 Playwright E2E + モバイル手動確認

**English:** Supabase + Next.js hosting; externalized env vars; service role key server-only; test before/after migrations; Playwright E2E + mobile manual check before production.

---

## 実装ギャップ（現行 → v6 目標）| Implementation Gaps (Current → v6 Target)

| 領域 / Area | 現行 / Current | v6 目標 / v6 Target | Phase / Spec |
|------|------|---------------|--------------|
| 承認順序 / Order | HR → Section Head | 所属上長 → HR / Section Head → HR | 1 / `008` |
| 却下理由 / Rejection | None | `rejection_reason` 必須 / Required | 1 / `008` |
| 休日・WFH 曜日 / Holidays & WFH | None | 特別休日・HR 割当 WFH / Special holidays, HR-assigned WFH | 2 / `009` |
| ステータスルール / Status rules | Manual Present, simple clock_out | OOO・早退・未打刻自動 / OOO, early CO, auto missing | 3 / `010` |
| 申請種別 / Types | `leave`, `late` only | 休暇4区分・OOO・WFH 等 / Leave units, OOO, WFH | 4 / `011` |
| スケジュール / Schedule | None | 毎時ジョブ・自動ボード / Hourly job, auto board | 5 / `012` |
| 有給 / Paid leave | Not implemented | フルエンジン / Full engine | 6 / `013` |
| 管理者 UI / Admin UI | `admin` role only | HR/SH 単一アカウント / HR/SH unified account | 7 / `014` |
| 取消・変更 / Cancel-edit | Not implemented | Per domain spec | 8 / `015` |

> **日本語:** ギャップ解消は `specs/007`–`015` と GitHub Issue #7–#15 で段階移行。正本: `docs/requirements/owner-brief-v6.md`。
> **English:** Close gaps via `specs/007`–`015` and Issues #7–#15. Canonical brief: `docs/requirements/owner-brief-v6.md`.

---

## ガバナンス | Governance

**日本語:** この憲法はすべての開発プラクティスに優先；修正にはドキュメント化・承認・移行計画必須；すべての PR でコンプライアンス確認；SASAERU 開発憲法（`sasaeru-app-clean/memory/constitution.md`）を源流とする派生版

**English:** This constitution overrides all other development practices. Amendments require documentation, approval, and migration plan. Every PR checks compliance. Derived from the SASAERU Development Constitution (`sasaeru-app-clean/memory/constitution.md`).

**Version**: 1.2.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06 | **Amendment**: v6 owner domain rules — paid-leave anniversary, leave units, OOO official/private, early leave as Clock Out branch, WFH weekday, company holidays, schedule/hourly refresh, auto missing-status, admin unified account; see `specs/007` and `docs/requirements/owner-brief-v6.md`
