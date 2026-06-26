## 目的 | Purpose

**日本語:** **管理機能**（ユーザー・部署・チーム）および **従業員招待** の現行挙動を、遡及ベースライン仕様として記録・承認する。

**English:** Record and approve **admin** (users, sections, teams) and **employee invite** as a retroactive baseline spec.

---

## 対象仕様書 | Target spec

- `specs/006-baseline-admin/requirements.md`
- `specs/006-baseline-admin/technical.md`
- `specs/006-baseline-admin/implementation.md`

---

## 憲法ギャップ | Constitution gaps

**日本語:**

- 有給の admin 一覧は未実装 — **別 Issue** で対応
- ロール昇格は `admin` のみ — 現行コードと一致（意図した仕様）

**English:**

- Paid leave admin views not implemented — **separate Issue**
- Role promotion restricted to `admin` — matches current code (intentional)

| 領域 / Area | ベースライン / Baseline | 憲法目標 / Target |
|-------------|------------------------|-------------------|
| 有給 admin 一覧 / Paid leave admin | 未実装 | admin が全員の有給状況を確認 |

---

## 承認チェックリスト | Approval checklist

- [ ] requirements.md を確認した / reviewed
- [ ] technical.md を確認した / reviewed
- [ ] implementation.md を確認した / reviewed
- [ ] ベースラインを **approved** とする / mark baseline as approved
