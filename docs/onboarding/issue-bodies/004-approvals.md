## 目的 | Purpose

**日本語:** **承認ワークフロー**・PDF 生成・MS Teams 通知の現行挙動を、遡及ベースライン仕様として記録・承認する。

**English:** Record and approve **approval workflow**, PDF generation, and MS Teams notifications as a retroactive baseline spec.

---

## 対象仕様書 | Target spec

- `specs/004-baseline-approvals/requirements.md`
- `specs/004-baseline-approvals/technical.md`
- `specs/004-baseline-approvals/implementation.md`

---

## 憲法ギャップ | Constitution gaps

**日本語:** 以下の差分は **別 Issue + 新 spec** で一括移行する（DB・トリガー・UI・テスト同時更新）。

**English:** Migrate via **separate Issue + new spec** with DB, triggers, UI, and tests updated together.

| 領域 / Area | ベースライン / Baseline | 憲法目標 / Target |
|-------------|------------------------|-------------------|
| 承認順序 / Order | 人事（HR）→ 所属上長 | 所属上長 → 人事 |
| 却下理由 / Rejection | 未記録 | `rejection_reason` 必須 |
| PDF 生成タイミング / PDF trigger | 所属上長承認時 | 2段階承認完了後（順序は目標フローに準拠） |

---

## 承認チェックリスト | Approval checklist

- [ ] requirements.md を確認した / reviewed
- [ ] technical.md を確認した / reviewed
- [ ] implementation.md を確認した / reviewed
- [ ] ベースラインを **approved** とする / mark baseline as approved
