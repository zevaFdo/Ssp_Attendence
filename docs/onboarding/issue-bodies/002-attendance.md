## 目的 | Purpose

**日本語:** **勤怠**（出退勤・ステータスボード・履歴・チームリーダー上書き）の現行挙動を、遡及ベースライン仕様として記録・承認する。

**English:** Record and approve **attendance** (clock in/out, status board, history, team leader override) as a retroactive baseline spec.

---

## 対象仕様書 | Target spec

- `specs/002-baseline-attendance/requirements.md`
- `specs/002-baseline-attendance/technical.md`
- `specs/002-baseline-attendance/implementation.md`

---

## 憲法ギャップ | Constitution gaps

**日本語:**

- ステータス ENUM は初期スキーマを超えて拡張済み（`meeting`, `break` 等）— 仕様書に記載済み
- 有給管理は未実装 — **別 Issue** で対応

**English:**

- Status enum extended beyond initial schema — documented in spec
- Paid leave not implemented — track in a **separate Issue**

| 領域 / Area | ベースライン / Baseline | 憲法目標 / Target |
|-------------|------------------------|-------------------|
| 有給 / Paid leave | 未実装 / Not implemented | 残日数・5日警告・admin 一覧 |

---

## 承認チェックリスト | Approval checklist

- [ ] requirements.md を確認した / reviewed
- [ ] technical.md を確認した / reviewed
- [ ] implementation.md を確認した / reviewed
- [ ] ベースラインを **approved** とする / mark baseline as approved
