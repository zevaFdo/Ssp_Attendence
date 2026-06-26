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

**日本語:** UI・ドキュメント・コメント・commit 全て日本語（英語 i18n キーは `en.json` に分離）；ロケール `ja-JP`、タイムゾーン `Asia/Tokyo` 固定；日付表示は `YYYY/MM/DD`、時刻は `HH:mm`（24時間制）；有給年度は会社カレンダーに従う（未設定時は4月1日〜翌3月31日を暫定とする）

**English:** UI, documentation, comments, and commits are in Japanese (English UI strings live in `en.json`). Locale `ja-JP`, timezone `Asia/Tokyo`. Dates display as `YYYY/MM/DD`, times as `HH:mm` (24-hour). Paid-leave fiscal year follows company calendar (default: April 1 – March 31 if unset).

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

### 申請フォーム | Request Form

| 項目 / Field | 仕様 / Specification |
|------|------|
| **申請種別 / Type** | 休暇・遅刻・早退・外出 / Leave, Late, Early leave, Out-of-office |
| **日付（休暇）/ Leave dates** | 1日 / 午前休 / 午後休、または日付 From〜To / Full, AM half, PM half, or date From–To |
| **日付（遅刻・早退・外出）/ Time-based** | 単日 + 時刻 From〜To（`HH:mm`）/ Single date + time From–To |
| **処理方法 / Processing** | 未選択可。有給（X日 / 0.5日 / X時間）、時間変更 / Optional: paid leave or schedule change |
| **理由/備考 / Reason** | 必須（現行5文字以上）/ Required (min 5 chars currently) |

#### 申請種別と入力フィールド | Request Type Field Mapping

```
休暇 / Leave     → date_from, date_to, leave_unit (full / am / pm)
遅刻 / Late      → date, time_from, time_to
早退 / Early     → date, time_from, time_to
外出 / Out       → date, time_from, time_to
```

#### 処理方法（任意）| Processing Method (Optional)

**日本語:**
- **有給**: 日数（整数・0.5日刻み）または時間
- **時間変更**: 変更後の勤務時間帯（From〜To）
- 未選択の場合も申請は受理

**English:**
- **Paid leave:** days (integer, 0.5-day increments) or hours
- **Schedule change:** new work hours (From–To)
- Requests are accepted even if processing method is not selected

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
| 第1承認 / 1st | 所属上長 / Section Head | 承認 / 却下（理由必須）/ Approve / Reject (reason required) |
| 第2承認 / 2nd | 人事 / HR | 承認 / 却下（理由必須）/ Approve / Reject (reason required) |
| 完了 / Done | システム / System | PDF 生成、Storage 保存、通知 / PDF, storage, notify |

> **移行注記 / Migration note:** Current implementation (`0003_workflow.sql`) uses HR → Section Head. Migrate to Section Head → HR via Issue with DB columns, triggers, and UI updated together.

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
| `admin` | 全権限、ユーザー招待、有給全員確認 / Full access, invites, all paid-leave views |
| `hr_supervisor` | 第2承認、従業員登録、全勤怠閲覧 / 2nd approver, register employees, all attendance |
| `section_head` | 第1承認（所属部署）、従業員登録 / 1st approver (own section), register employees |
| `team_leader` | 自チーム勤怠上書き、チームステータス / Override team attendance, team status |
| `employee` | 出退勤、申請、自分の履歴・有給 / Clock in/out, requests, own history & leave |

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

## 実装ギャップ（現行 → 目標）| Implementation Gaps (Current → Target)

| 領域 / Area | 現行 / Current | 目標 / Target |
|------|------|---------------|
| 申請種別 / Types | `leave`, `late` only | 休暇・遅刻・早退・外出 / 4 types |
| 日付/時刻 / Dates | Single `date` | 休暇単位・期間・時刻 From-To / Units, ranges, times |
| 処理方法 / Processing | None | 有給 / 時間変更 / Paid leave, schedule change |
| 承認順序 / Order | HR → Section Head | 所属上長 → 人事 / Section Head → HR |
| 却下理由 / Rejection | None | 必須入力 / Required |
| 有給管理 / Paid leave | Not implemented | 残日数・5日警告・admin 一覧 |
| 取消・変更 / Cancel-edit | Not implemented | Per domain spec above |

> **日本語:** ギャップ解消は個別 Issue と仕様書で管理し、段階的に移行する。
> **English:** Close gaps via individual Issues and specs; migrate incrementally, not in one risky batch.

---

## ガバナンス | Governance

**日本語:** この憲法はすべての開発プラクティスに優先；修正にはドキュメント化・承認・移行計画必須；すべての PR でコンプライアンス確認；SASAERU 開発憲法（`sasaeru-app-clean/memory/constitution.md`）を源流とする派生版

**English:** This constitution overrides all other development practices. Amendments require documentation, approval, and migration plan. Every PR checks compliance. Derived from the SASAERU Development Constitution (`sasaeru-app-clean/memory/constitution.md`).

**Version**: 1.1.0 | **Ratified**: 2026-06-26 | **Last Amended**: 2026-06-26 | **Amendment**: Bilingual format (Japanese primary, English secondary); chat language rule in `.cursorrules`
