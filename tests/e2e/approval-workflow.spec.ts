import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import type { Browser } from "@playwright/test";
import type { Database } from "@/types/database.types";
import {
  approveFromApprovalsQueue,
  expectRequestInApprovalsQueue,
  openRejectDialogOnDetail,
} from "./helpers/auth";
import { hasSupabaseTestEnv } from "./helpers/env";
import { getSupabaseTestKey } from "../integration/helpers/env";

const describeIfSupabase = hasSupabaseTestEnv() ? test.describe : test.describe.skip;

async function deleteRequest(requestId: string): Promise<void> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseTestKey(),
  );
  await supabase
    .from("notifications")
    .delete()
    .eq("related_request_id", requestId);
  await supabase.from("requests").delete().eq("id", requestId);
}

async function createLeaveRequestViaUi(
  browser: Browser,
  reasonMarker: string,
  date: string,
): Promise<string> {
  const employeeContext = await browser.newContext({
    storageState: "playwright/.auth/employee.json",
  });
  const employeePage = await employeeContext.newPage();
  try {
    await employeePage.goto("/requests/new", { waitUntil: "domcontentloaded" });
    await employeePage.locator("#date").fill(date);
    await employeePage.locator("#reason").fill(reasonMarker);
    await employeePage
      .getByRole("button", { name: /submit request|申請を送信/i })
      .click();
    await employeePage.waitForURL(/\/requests\/[0-9a-f-]+$/i, {
      timeout: 15000,
    });
    const requestId =
      employeePage.url().match(/\/requests\/([0-9a-f-]+)$/i)?.[1] ?? null;
    expect(requestId).toBeTruthy();
    return requestId!;
  } finally {
    await employeeContext.close();
  }
}

test.describe("Approval workflow (smoke)", () => {
  test("approvals page requires auth redirect or queue UI", async ({ page }) => {
    await page.goto("/approvals");
    await expect(page).toHaveURL(/\/(login|approvals)/);
  });
});

describeIfSupabase("Approval workflow (SH → HR)", () => {
  test.describe.configure({ mode: "serial" });

  let requestId: string;
  let reasonMarker: string;

  test.beforeAll(async ({ browser }) => {
    reasonMarker = `E2E approval ${Date.now()}`;
    requestId = await createLeaveRequestViaUi(
      browser,
      reasonMarker,
      "2026-12-15",
    );
  });

  test.afterAll(async () => {
    if (requestId) {
      await deleteRequest(requestId);
    }
  });

  test("section head approves on /approvals", async ({ browser }) => {
    const sectionHeadContext = await browser.newContext({
      storageState: "playwright/.auth/section-head.json",
    });
    const sectionHeadPage = await sectionHeadContext.newPage();
    try {
      await expectRequestInApprovalsQueue(sectionHeadPage, reasonMarker, "sh");
      await approveFromApprovalsQueue(
        sectionHeadPage,
        reasonMarker,
        requestId,
        "section_head",
      );
    } finally {
      await sectionHeadContext.close();
    }
  });

  test("HR approves on /approvals and document is ready", async ({ browser }) => {
    const hrContext = await browser.newContext({
      storageState: "playwright/.auth/hr.json",
    });
    const hrPage = await hrContext.newPage();
    try {
      await expectRequestInApprovalsQueue(hrPage, reasonMarker, "hr");
      await approveFromApprovalsQueue(hrPage, reasonMarker, requestId, "hr");
      await expect
        .poll(
          async () => {
            const { data } = await createClient<Database>(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              getSupabaseTestKey(),
            )
              .from("requests")
              .select("document_path, hr_approval")
              .eq("id", requestId)
              .single();
            return data;
          },
          { timeout: 10000 },
        )
        .toMatchObject({ hr_approval: "approved", document_path: expect.any(String) });

      await hrPage.goto(`/requests/${requestId}`, {
        waitUntil: "networkidle",
      });
      await expect(
        hrPage.getByText(/approval document ready|承認書類の準備ができました/i),
      ).toBeVisible();
      await expect(
        hrPage.getByRole("link", { name: /download pdf|PDFをダウンロード/i }),
      ).toBeVisible({ timeout: 10000 });
    } finally {
      await hrContext.close();
    }
  });
});

describeIfSupabase("Approval reject dialog (375px)", () => {
  test("reject dialog opens and validates reason length", async ({
    browser,
  }: {
    browser: Browser;
  }) => {
    const marker = `E2E reject ${Date.now()}`;
    const rejectRequestId = await createLeaveRequestViaUi(
      browser,
      marker,
      "2026-12-16",
    );

    const sectionHeadContext = await browser.newContext({
      storageState: "playwright/.auth/section-head.json",
    });

    try {
      const sectionHeadPage = await sectionHeadContext.newPage();
      await sectionHeadPage.setViewportSize({ width: 375, height: 667 });
      await openRejectDialogOnDetail(sectionHeadPage, rejectRequestId);

      await sectionHeadPage
        .getByRole("dialog")
        .getByRole("button", { name: /^reject$|却下する/i })
        .click();
      await expect(
        sectionHeadPage.getByText(/at least 5 characters|5文字以上/i),
      ).toBeVisible();

      await sectionHeadPage
        .getByRole("dialog")
        .locator("textarea")
        .fill("E2E rejection reason");
      await sectionHeadPage
        .getByRole("dialog")
        .getByRole("button", { name: /^reject$|却下する/i })
        .click();

      await expect
        .poll(
          async () => {
            const { data } = await createClient<Database>(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              getSupabaseTestKey(),
            )
              .from("requests")
              .select("rejection_reason, section_head_approval")
              .eq("id", rejectRequestId)
              .single();
            return data;
          },
          { timeout: 10000 },
        )
        .toMatchObject({
          section_head_approval: "rejected",
          rejection_reason: "E2E rejection reason",
        });

      await sectionHeadPage.goto(`/requests/${rejectRequestId}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(
        sectionHeadPage.getByText("E2E rejection reason"),
      ).toBeVisible();
      await sectionHeadContext.close();
    } finally {
      await deleteRequest(rejectRequestId);
      await sectionHeadContext.close();
    }
  });
});
