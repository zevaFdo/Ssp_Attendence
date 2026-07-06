# 01. Attendance Web 開発憲法エッセンス（10 分版）
# 01. Attendance Web Constitution Essence (10-Minute Read)

> **Primary / 主言語:** 日本語 | **Secondary / 副言語:** English
> **Canonical source / 正本:** `/memory/constitution.md` v1.2.0（2026-07-06 承認済み）
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

**日本語:** UI（主: `ja.json`）、コメント、commit、PR は日本語。ロケール `ja-JP`、タイムゾーン `Asia/Tokyo`。有給年度は**入社+6か月** anniversary。

**English:** UI (primary: `ja.json`), comments, commits, PRs in Japanese. Locale `ja-JP`, timezone `Asia/Tokyo`. Paid-leave year starts at **hire + 6 months** anniversary.

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

**日本語:** 所属上長（`section_head`、いずれか一方）→ 人事（`hr_supervisor`）。却下時は `rejection_reason` 必須。SH 却下は HR 非通知。完了後 PDF 自動生成。

**English:** Section Head (either one) → HR. `rejection_reason` required on reject. SH rejection does not notify HR. PDF after full approval.

> **移行注記 / Migration note:** Current code may still use HR → Section Head. Migrate via Issue — do not ad-hoc patch.

### XII. 有給管理 | Paid Leave Management

**日本語:** 全員が自分の残日数確認。admin は全員一覧。年度 5 日未満取得者に2か月前警告。

**English:** Everyone views own balance. Admin views all. Warn employees with < 5 days taken, 2 months before year-end.

---

## ドメイン要点（v6）| Domain Essentials (v6)

**正本 / Canonical:** `docs/requirements/owner-brief-v6.md`

### 会社ルール | Company rules

| 項目 / Item | 値 / Value |
|-------------|------------|
| 勤務時間 / Hours | 09:00–17:30 |
| 昼食 / Lunch | 12:00–13:00（外のみ Lunch 可） |
| 特別休日 / Special holidays | 12/29–1/4、8/14–8/16（操作ブロックなし） |
| 有給年度 / Paid-leave year | 入社+6か月 anniversary |

### 申請・ステータス | Requests & status

| 項目 / Field | 仕様 / Spec |
|--------------|-------------|
| 休暇 / Leave | 終日、午前短時間（9–14）、午後短時間（13–17:30） |
| 早退 / Early leave | Clock Out 内分岐（17:30前）— 独立申請ではない |
| 外出 / OOO | 公務（同僚最大10名）vs 私用（承認要） |
| WFH | HR 割当固定曜日は即時；それ以外は承認 |
| 補填 / Compensation | Late・私用 OOO: 延長・有給時間休・無給（延長記録不要） |
| 未打刻 / Missing status | 09:00 ちょうどに `late` 自動更新、「更新し忘れ」で HR 通知 |
| スケジュール / Schedule | 未来承認は**当日のみ**ボード表示、08:00–17:00 毎時リフレッシュ |
| 遡及申請 / Retroactive | 最大 30 日前まで |

### 承認 | Approval

```
申請者 → 所属上長（どちらか一方）→ 人事 → PDF
         ↓却下（HR非通知）  ↓却下
      理由+申請者のみ    理由+通知

Applicant → Section Head (either) → HR → PDF
              ↓ reject (no HR)     ↓ reject
           reason+applicant      reason+notify
```

### 有給・取消 | Paid Leave & Cancel/Edit

**日本語:**
- 有給: Phase 6（`specs/013`）— 10→20日、繰越2年、時間休40h、5日義務
- 取消・変更: Phase 8（`specs/015`）

**English:**
- Paid leave: Phase 6 (`specs/013`)
- Cancel/edit: Phase 8 (`specs/015`)

---

## 実装ギャップ（v6 フェーズ）| Implementation Gaps (v6 Phases)

| Phase | Spec | 内容 / Content |
|-------|------|----------------|
| 1 | `008` | 承認順序・却下理由 |
| 2 | `009` | 休日カレンダー・WFH 曜日 |
| 3 | `010` | OOO・早退・未打刻 |
| 4 | `011` | 申請種別拡張 |
| 5 | `012` | スケジュール・毎時ジョブ |
| 6 | `013` | 有給 |
| 7 | `014` | 管理者・単一アカウント |
| 8 | `015` | 取消・編集 |

**現行コード / Current code:** 承認は HR → Section Head（`0003_workflow.sql`）。`specs/008` で移行。

---

## 実装ギャップ（レガシー要約）| Legacy Gap Summary

| 領域 / Area | 現行 / Current | v6 目標 / Target |
|-------------|----------------|----------------|
| 承認順 / Approval order | HR → Section Head | Section Head → HR |
| 却下理由 / Rejection reason | None | `rejection_reason` required |
| 申請種別 / Types | `leave`, `late` | Leave units, OOO, WFH, etc. |
| 有給 / Paid leave | Not implemented | Full engine (Phase 6) |
| 取消・変更 / Cancel-edit | Not implemented | Phase 8 |

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
2. `docs/requirements/owner-brief-v6.md` — v6 owner requirements / オーナー要件正本
3. `docs/handover/agent-handover-v6-requirements.md` — v6 handover / v6 引き継ぎ
4. `/.cursorrules` — AI agent instructions / AI 向け指示書
5. [`02-baseline-issues.md`](./02-baseline-issues.md) — retroactive baseline specs & GitHub Issues / 遡及ベースライン仕様
