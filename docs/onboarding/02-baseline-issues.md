# 02. 遡及ベースライン仕様 — GitHub Issue 起票ガイド
# 02. Retroactive Baseline Specs — GitHub Issue Guide

> **Primary / 主言語:** 日本語 | **Secondary / 副言語:** English
> **前提 / Prerequisite:** `gh auth login` で GitHub CLI を認証してから起票してください。

---

## 概要 | Overview

**日本語:** 憲法採用前に実装済みの主要ドメインについて、**現行挙動のベースライン仕様**を `specs/001`〜`006` に文書化済みです。各ドメインに対応する GitHub Issue を起票し、仕様書の `Related Issue` を実際の番号に更新してください。

**English:** Baseline specs for six pre-constitution domains live in `specs/001`–`006`. Open matching GitHub Issues and update each spec’s `Related Issue` field with the real number.

---

## 起票状況 | Issue status

**日本語:** 以下 6 Issue は起票済み。各 `specs/00N-*/requirements.md` の `Related Issue` にリンク済み。

**English:** All six issues are open; each spec’s `Related Issue` field is linked.

| Spec ID | GitHub Issue | ドメイン / Domain |
|---------|--------------|-------------------|
| 001 | [#1](https://github.com/zevaFdo/Ssp_Attendence/issues/1) | 認証・セッション / Auth & session |
| 002 | [#2](https://github.com/zevaFdo/Ssp_Attendence/issues/2) | 勤怠・ステータスボード / Attendance |
| 003 | [#3](https://github.com/zevaFdo/Ssp_Attendence/issues/3) | 休暇・遅刻申請 / Requests |
| 004 | [#4](https://github.com/zevaFdo/Ssp_Attendence/issues/4) | 承認・PDF・Teams / Approvals |
| 005 | [#5](https://github.com/zevaFdo/Ssp_Attendence/issues/5) | アプリ内通知 / Notifications |
| 006 | [#6](https://github.com/zevaFdo/Ssp_Attendence/issues/6) | 管理・従業員招待 / Admin |

---

## 起票コマンド例（参考）| Example `gh` commands (reference)

**日本語:** 既に起票済みのため、新規作成は不要です。再作成する場合のみ以下を参照。

**English:** Issues already exist — no need to re-run. For reference only:

```bash
gh issue create --title "[Baseline] 認証・セッション" --label "baseline,documentation" --body-file docs/onboarding/issue-bodies/001-auth.md
gh issue create --title "[Baseline] 勤怠・ステータスボード" --label "baseline,documentation" --body-file docs/onboarding/issue-bodies/002-attendance.md
gh issue create --title "[Baseline] 休暇・遅刻申請" --label "baseline,documentation" --body-file docs/onboarding/issue-bodies/003-requests.md
gh issue create --title "[Baseline] 承認・PDF・Teams" --label "baseline,documentation" --body-file docs/onboarding/issue-bodies/004-approvals.md
gh issue create --title "[Baseline] アプリ内通知" --label "baseline,documentation" --body-file docs/onboarding/issue-bodies/005-notifications.md
gh issue create --title "[Baseline] 管理・従業員招待" --label "baseline,documentation" --body-file docs/onboarding/issue-bodies/006-admin.md
```

---

## ベースライン一覧 | Baseline index

| Spec ID | ドメイン / Domain | 仕様書 / Spec path |
|---------|-------------------|-------------------|
| 001 | 認証・セッション / Auth & session | [`specs/001-baseline-auth/`](../specs/001-baseline-auth/) |
| 002 | 勤怠・ステータスボード / Attendance | [`specs/002-baseline-attendance/`](../specs/002-baseline-attendance/) |
| 003 | 申請（休暇・遅刻）/ Requests | [`specs/003-baseline-requests/`](../specs/003-baseline-requests/) |
| 004 | 承認・PDF・Teams / Approvals | [`specs/004-baseline-approvals/`](../specs/004-baseline-approvals/) |
| 005 | 通知 / Notifications | [`specs/005-baseline-notifications/`](../specs/005-baseline-notifications/) |
| 006 | 管理・招待 / Admin & invite | [`specs/006-baseline-admin/`](../specs/006-baseline-admin/) |

---

## 次のステップ | Next steps

**日本語:**

1. ~~上記 Issue を起票し、仕様書に Issue 番号を反映~~ ✅ 完了（#1–#6）
2. 各 Issue の承認チェックリストを完了し、ベースラインを正式承認
3. 憲法ギャップ（承認順序・申請種別など）は **別 Issue + 新 spec** で移行
4. ベースライン承認後、当該ドメインの変更は通常の spec-first フローに従う

**English:**

1. ~~Create issues and link numbers in specs~~ ✅ Done (#1–#6)
2. Complete each issue’s approval checklist and formally approve baselines
3. Track constitution gaps as **separate migration Issues**
4. After baseline approval, changes follow normal spec-first workflow
