# 承認・PDF・Teams — 要件定義（ベースライン）
# Approvals, PDF & Teams — Requirements (Baseline)

> **Spec ID:** `specs/004-baseline-approvals/`
> **Related Issue:** [#4](https://github.com/zevaFdo/Ssp_Attendence/issues/4) — 承認・PDF・Teams / Approvals
> **Status:** approved (baseline)

---

## 概要 | Overview

**日本語:** 申請は **HR（第1承認）→ 所属上長 Section Head（第2承認）** の順で処理される（憲法目標とは逆順）。両方承認後、Section Head 承認時に PDF 自動生成・Storage 保存。却下理由の入力はない。

**English:** Requests flow **HR (1st) → Section Head (2nd)** — opposite of constitution target. PDF generated on Section Head approval. No rejection reason capture.

---

## 承認フロー（現行）| Approval flow (current)

```
申請者 → HR → Section Head → PDF + document_path
           ↓ reject    ↓ reject
        従業員通知   従業員通知

Applicant → HR → Section Head → PDF
              ↓ reject   ↓ reject
           notify     notify
```

| 段階 | 担当 | 操作 |
|------|------|------|
| 第1 | `hr_supervisor` | Approve / Reject |
| 第2 | `section_head` | Approve / Reject → PDF on approve |
| 完了 | システム | `request-documents/{user_id}/{request_id}.pdf` |

---

## 受け入れ条件（現行）| Acceptance Criteria (current)

1. HR が `/approvals` で pending 申請を承認/却下できる
2. HR 承認後、Section Head（またはフォールバック全 section_head）に通知
3. Section Head 承認で PDF 生成・アップロード・`document_path` 更新
4. PDF 失敗時も承認は維持され、警告を返す
5. `/api/requests/{id}/pdf` で署名付き URL（60秒）ダウンロード
6. Teams Webhook で申請作成時に Adaptive Card（設定時のみ）

---

## 憲法ギャップ | Constitution gaps

| 領域 | ベースライン | 憲法目標 |
|------|-------------|----------|
| 承認順序 | HR → Section Head | Section Head → HR |
| 却下理由 | なし | `rejection_reason` 必須 |

**移行:** 別 Issue + 新 spec（DB カラム・トリガー・UI 一括）

---

## 承認 | Approval

| 段階 / Stage | 承認者 / Approver | 日付 / Date | 署名 / Sign-off |
|--------------|-------------------|-------------|-----------------|
| requirements | Baseline adoption | 2026-06-26 | [x] |
