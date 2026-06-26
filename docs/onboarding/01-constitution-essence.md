# 01. Attendance Web 開発憲法エッセンス（10 分版）
# 01. Attendance Web Constitution Essence (10-Minute Read)

> **Primary / 主言語:** 日本語 | **Secondary / 副言語:** English
> **Canonical source / 正本:** `/memory/constitution.md` v1.1.0（2026-06-26）
> **日本語:** 本文は正本のダイジェスト。**判断に迷ったら正本を優先**してください。
> **English:** This is a digest of the canonical constitution. **When in doubt, read the full constitution.**

---

## なぜ「憲法」なのか | Why a "Constitution"?

**日本語:** Attendance Web には「これだけは絶対に曲げない」と決めたルールがあります。曲げないと決めているからこそ:

- 「忙しいから今回だけ」が無い
- 「動いてるからOK」が無い
- AI が知らないルールで生成したコードは即却下される
- レビューを通すかどうかが客観的に判定できる

**読まずに着手すると違反します**。

**English:** Attendance Web has non-negotiable rules. That means:

- No "just this once because we're busy"
- No "it works so it's fine"
- AI-generated code that ignores these rules gets rejected
- Review decisions are objective

**Do not start work without reading this.**

---

## 12 の原則（一行サマリ）| 12 Principles (One-Line Summary)

### I. 仕様駆動開発 | Spec-Driven Development

**日本語:** すべての機能は仕様書作成から始める。`specs/[ID]-[name]/` に requirements → technical → implementation の 3 段階で承認を得る。

**English:** Every feature starts with a spec in `specs/[ID]-[name]/`: requirements → technical → implementation, each approved before proceeding.

### II. テストファースト（非交渉）| Test-First (Non-Negotiable)

**日本語:** テスト作成 → RED 確認 → 実装 → GREEN。実装後テストは違反。Supabase 統合テストは実 DB。

**English:** Write tests → confirm RED → implement → GREEN. Post-hoc tests violate the constitution. Integration tests use real Supabase/PostgreSQL.

### III. 統合テスト重視 | Integration Testing

**日本語:** Vitest/Jest（単体）→ Server Actions 統合 → Playwright E2E の 3 層。

**English:** Three layers: Vitest/Jest (unit) → Server Actions integration → Playwright E2E.

### IV. 日本語開発環境 | Japanese Development Environment

**日本語:** UI（主: `ja.json`）、コメント、commit、PR は日本語。ロケール `ja-JP`、タイムゾーン `Asia/Tokyo`。i18n 副言語は `en.json`。

**English:** UI (primary: `ja.json`), comments, commits, PRs in Japanese. Locale `ja-JP`, timezone `Asia/Tokyo`. Secondary UI in `en.json`.

### V. 観測可能性 | Observability

**日本語:** 構造化ログ。申請 ID・ユーザー ID・承認段階を含める。機微情報はログに書かない。

**English:** Structured logs with request ID, user ID, approval stage. Never log secrets or PII.

### VI. 効率的タイムアウト（非交渉）| Efficient Timeouts (Non-Negotiable)

**日本語:** テスト最大 15 秒 / 本番 Server Action 最大 10 秒。**固定値。変更厳禁。**

**English:** Test max 15s / production Server Action max 10s. **Fixed — do not increase.**

### VII. その場しのぎコード禁止 | No Workarounds

**日本語:** テストを通すためだけの実装・仕様の独断緩和は禁止。問題時は人間に修正案を提示。

**English:** No test-passing hacks or unilateral spec changes. Propose fixes to humans.

### VIII. ブラウザテスト実証必須 | Browser Verification Required

**日本語:** Playwright + 手動確認（375px モバイル含む）。テスト未実行での完了報告は憲法違反。

**English:** Playwright + manual check (including 375px mobile). Reporting done without tests is a violation.

### IX. モバイルファースト UI | Mobile-First UI

**日本語:** Tailwind + Radix UI。デスクトップはサイドバー、モバイルはボトムナビ。タッチ 44×44px 以上。

**English:** Tailwind + Radix. Sidebar on desktop, bottom nav on mobile. Min 44×44px touch targets.

### X. Supabase RLS セキュリティ | Supabase RLS Security

**日本語:** 全業務テーブルに RLS。Service Role Key はサーバー専用。承認カラムは DB トリガーでガード。

**English:** RLS on all business tables. Service role key server-only. Approval columns guarded by DB triggers.

### XI. 承認ワークフロー | Approval Workflow

**日本語:** 所属上長（`section_head`）→ 人事（`hr_supervisor`）。却下時は理由必須。完了後 PDF 自動生成。

**English:** Section Head → HR. Rejection reason required. PDF auto-generated on full approval.

> **移行注記 / Migration note:** Current code may still use HR → Section Head. Migrate via Issue — do not ad-hoc patch.

### XII. 有給管理 | Paid Leave Management

**日本語:** 全員が自分の残日数確認。admin は全員一覧。年度 5 日未満取得者に2か月前警告。

**English:** Everyone views own balance. Admin views all. Warn employees with < 5 days taken, 2 months before year-end.

---

## ドメイン要点 | Domain Essentials

### 申請フォーム | Request Form

| 項目 / Field | 仕様 / Spec |
|--------------|-------------|
| 申請種別 / Type | 休暇・遅刻・早退・外出 / Leave, Late, Early leave, Out-of-office |
| 休暇 / Leave | 1日 / 午前 / 午後、または日付 From–To |
| 時刻系 / Time-based | 単日 + 時刻 From–To |
| 処理方法 / Processing | 任意：有給 or 時間変更 / Optional: paid leave or schedule change |
| 理由 / Reason | 必須（現行 5 文字以上）/ Required (min 5 chars currently) |

### 承認 | Approval

```
申請者 → 所属上長 → 人事 → PDF
         ↓却下      ↓却下
      理由+通知   理由+通知

Applicant → Section Head → HR → PDF
              ↓ reject     ↓ reject
           reason+notify reason+notify
```

### 有給・取消 | Paid Leave & Cancel/Edit

**日本語:**
- 有給残日数：自分で確認、admin は全員
- 5日義務：年度末2か月前から警告
- 取消・変更：承認前は自由、承認後は制限

**English:**
- Paid leave balance: self-view; admin sees all
- 5-day rule: warn 2 months before year-end
- Cancel/edit: free before approval; restricted after

---

## 実装ギャップ（要対応）| Implementation Gaps (To Address)

| 領域 / Area | 現行 / Current | 目標 / Target |
|-------------|----------------|---------------|
| 申請種別 / Types | `leave`, `late` | 4 types |
| 日付/時刻 / Dates | Single `date` | Range + time From–To |
| 処理方法 / Processing | None | Paid leave / schedule change |
| 承認順 / Approval order | HR → Section Head | Section Head → HR |
| 却下理由 / Rejection reason | None | Required |
| 有給 / Paid leave | Not implemented | Balance + warnings |
| 取消・変更 / Cancel-edit | Not implemented | Per spec |

---

## チャット vs 文書 | Chat vs Documents

| Context | Language |
|---------|----------|
| AI chat responses | **English** |
| Project documents (`docs/`, `memory/`, `specs/`) | **Japanese + English** |
| UI strings | `ja.json` (primary) + `en.json` |
| Code comments & commits | **Japanese** |

---

## 次に読むもの | Read Next

1. `/memory/constitution.md` — full constitution / 開発憲法（全文）
2. `/.cursorrules` — AI agent instructions / AI 向け指示書
3. `/README.md` — setup & architecture / セットアップ
