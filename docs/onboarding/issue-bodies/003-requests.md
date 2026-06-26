## 目的 | Purpose

**日本語:** **休暇・遅刻申請**（作成・一覧・詳細）の現行挙動を、遡及ベースライン仕様として記録・承認する。

**English:** Record and approve **leave & late requests** (create, list, detail) as a retroactive baseline spec.

---

## 対象仕様書 | Target spec

- `specs/003-baseline-requests/requirements.md`
- `specs/003-baseline-requests/technical.md`
- `specs/003-baseline-requests/implementation.md`

---

## 憲法ギャップ | Constitution gaps

**日本語:** 以下の差分は **別 Issue + 新 spec** で移行する（本ベースラインは現行のまま凍結）。

**English:** Migrate the following via **separate Issues + new specs** (this baseline stays frozen as-is).

| 領域 / Area | ベースライン / Baseline | 憲法目標 / Target |
|-------------|------------------------|-------------------|
| 申請種別 / Types | `leave`, `late` のみ | 休暇・遅刻・早退・外出（4種別） |
| 日付・時刻 / Dates | 単一 `date` | 期間・半休・時刻 From–To |
| 処理方法 / Processing | なし | 有給 / 時間変更 |
| 取消・変更 / Cancel-edit | 未実装 | ドメイン仕様に準拠 |

---

## 承認チェックリスト | Approval checklist

- [ ] requirements.md を確認した / reviewed
- [ ] technical.md を確認した / reviewed
- [ ] implementation.md を確認した / reviewed
- [ ] ベースラインを **approved** とする / mark baseline as approved
