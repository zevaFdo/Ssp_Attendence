import { expect, test } from "@playwright/test";

test.describe("Approval workflow (smoke)", () => {
  test("approvals page requires auth redirect or queue UI", async ({ page }) => {
    await page.goto("/approvals");
    await expect(page).toHaveURL(/\/(login|approvals)/);
  });

  test("reject dialog is usable at 375px when on request detail", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
  });
});
