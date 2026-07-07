import { test as setup } from "@playwright/test";
import { E2E_USERS, loginAs } from "./helpers/auth";
import { hasSupabaseTestEnv } from "./helpers/env";

const describeIfSupabase = hasSupabaseTestEnv() ? setup.describe : setup.describe.skip;

describeIfSupabase("authenticate demo users", () => {
  setup("employee", async ({ page }) => {
    const { employee } = E2E_USERS;
    await loginAs(page, employee.email, employee.password);
    await page.context().storageState({ path: "playwright/.auth/employee.json" });
  });

  setup("section head", async ({ page }) => {
    const { sectionHead } = E2E_USERS;
    await loginAs(page, sectionHead.email, sectionHead.password);
    await page
      .context()
      .storageState({ path: "playwright/.auth/section-head.json" });
  });

  setup("hr", async ({ page }) => {
    const { hr } = E2E_USERS;
    await loginAs(page, hr.email, hr.password);
    await page.context().storageState({ path: "playwright/.auth/hr.json" });
  });
});
