## 目的 | Purpose

**日本語:** 承認順序を **所属上長（第1）→ HR（第2）** に移行し、`rejection_reason` を必須化する。Phase 1 クリティカルパス。

**English:** Migrate approval to **Section Head (1st) → HR (2nd)** and require `rejection_reason`. Phase 1 critical path.

---

## 対象仕様書 | Target spec

- `specs/008-approval-workflow-reorder/requirements.md`
- `technical.md` / `implementation.md`（承認後に作成）

---

## ベースラインギャップ | Baseline gap

| 領域 | 現行 (`004`) | 目標 |
|------|-------------|------|
| 順序 | HR → Section Head | Section Head → HR |
| 却下理由 | なし | 必須 |

---

## 承認チェックリスト | Approval checklist

- [ ] requirements.md を確認した / reviewed
- [ ] technical.md を確認した / reviewed
- [ ] implementation.md を確認した / reviewed
- [ ] テストファースト（RED → GREEN）完了 / test-first complete
- [ ] 統合テスト + E2E パス / integration + E2E pass
