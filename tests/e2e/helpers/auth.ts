import { createClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";
import type { Database } from "@/types/database.types";
import { getSupabaseTestKey } from "../../integration/helpers/env";

const DEFAULT_PASSWORD = "Password123!";

export const E2E_USERS = {
  employee: {
    email: process.env.E2E_EMPLOYEE_EMAIL ?? "emp.bk1@demo.com",
    password: process.env.E2E_EMPLOYEE_PASSWORD ?? DEFAULT_PASSWORD,
  },
  sectionHead: {
    email: process.env.E2E_SECTION_HEAD_EMAIL ?? "eng.head@demo.com",
    password: process.env.E2E_SECTION_HEAD_PASSWORD ?? DEFAULT_PASSWORD,
  },
  hr: {
    email: process.env.E2E_HR_EMAIL ?? "hr1@demo.com",
    password: process.env.E2E_HR_PASSWORD ?? DEFAULT_PASSWORD,
  },
} as const;

function supabaseAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabaseTestKey(),
  );
}

export async function loginAs(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /sign in|サインイン/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 15000,
  });
  await expect(page.locator("header")).toBeVisible({ timeout: 10000 });
}

export async function expectRequestInApprovalsQueue(
  page: Page,
  reasonMarker: string,
  queue: "sh" | "hr",
): Promise<void> {
  await page.goto("/approvals", { waitUntil: "domcontentloaded" });
  if (queue === "hr") {
    await page.getByRole("tab", { name: /hr queue|HRキュー/i }).click();
  }
  await expect(
    page.locator("li").filter({ hasText: reasonMarker }),
  ).toHaveCount(1);
}

async function waitForApprovalColumn(
  requestId: string,
  column: "section_head_approval" | "hr_approval",
): Promise<void> {
  await expect
    .poll(
      async () => {
        const { data } = await supabaseAdmin()
          .from("requests")
          .select("section_head_approval, hr_approval")
          .eq("id", requestId)
          .single();
        if (!data) return null;
        return data[column];
      },
      { timeout: 10000 },
    )
    .toBe("approved");
}

export async function approveRequestOnDetail(
  page: Page,
  requestId: string,
  stage: "section_head" | "hr",
): Promise<void> {
  await page.goto(`/requests/${requestId}`, { waitUntil: "networkidle" });
  const approveButton = page.getByRole("button", {
    name: /^approve$|^承認$/i,
  });
  await approveButton.scrollIntoViewIfNeeded();
  await expect(approveButton).toBeEnabled();
  await approveButton.click();
  const column =
    stage === "hr" ? "hr_approval" : "section_head_approval";
  await waitForApprovalColumn(requestId, column);
}

export async function approveFromApprovalsQueue(
  page: Page,
  reasonMarker: string,
  requestId: string,
  stage: "section_head" | "hr" = "section_head",
): Promise<void> {
  await expect(
    page.locator("li").filter({ hasText: reasonMarker }),
  ).toHaveCount(1);
  await approveRequestOnDetail(page, requestId, stage);
}

export async function openRejectDialogOnDetail(
  page: Page,
  requestId: string,
): Promise<void> {
  await page.goto(`/requests/${requestId}`, { waitUntil: "networkidle" });
  const rejectButton = page.getByRole("button", {
    name: /^reject$|^却下$/i,
  });
  await rejectButton.scrollIntoViewIfNeeded();
  await expect(rejectButton).toBeEnabled();
  await rejectButton.click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });
}
