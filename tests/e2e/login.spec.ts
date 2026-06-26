import { expect, test } from "@playwright/test";

test.describe("Login page (smoke)", () => {
  test("renders sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|サインイン/i }),
    ).toBeVisible();
  });

  test("renders at 375px mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|サインイン/i }),
    ).toBeVisible();
  });
});
