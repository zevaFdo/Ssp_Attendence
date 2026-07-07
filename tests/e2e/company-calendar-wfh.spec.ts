import { expect, test } from "@playwright/test";
import { hasSupabaseTestEnv } from "./helpers/env";

const describeIfSupabase = hasSupabaseTestEnv() ? test.describe : test.describe.skip;

test.describe("Company calendar & WFH (smoke)", () => {
  test("holidays page requires auth redirect or UI", async ({ page }) => {
    await page.goto("/settings/holidays");
    await expect(page).toHaveURL(/\/(login|settings\/holidays)/);
  });
});

describeIfSupabase("Company calendar & WFH (HR)", () => {
  test.use({ storageState: "playwright/.auth/hr.json" });

  test("HR can add custom holiday and see it listed", async ({ page }) => {
    const marker = `E2E holiday ${Date.now()}`;
    await page.goto("/settings/holidays", { waitUntil: "networkidle" });
    const addButton = page
      .getByRole("main")
      .getByRole("button", { name: /add holiday|休日を追加/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
    const nameInput = page.locator("#holiday-name");
    await expect(nameInput).toBeVisible();
    await nameInput.fill(marker);
    await page.locator("#holiday-date").fill("2099-03-01");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /^add holiday$|^休日を追加$/i })
      .click();
    await expect(page.getByText(marker)).toBeVisible();
  });

  test("HR can assign WFH weekday on employees page", async ({ page }) => {
    await page.goto("/employees", { waitUntil: "networkidle" });
    const wfhSelect = page
      .getByRole("combobox", { name: /assign default wfh|wfh 固定曜日を割当/i })
      .first();
    await expect(wfhSelect).toBeEnabled();
    await wfhSelect.click();
    await page.getByRole("option", { name: /wednesday|水曜/i }).click();
    await expect(wfhSelect).toContainText(/wednesday|水曜/i);
  });
});
