import fs from "fs";
import path from "path";
import { defineConfig, devices } from "@playwright/test";

/** Playwright 本体は Next と別プロセスのため .env.local を読み込む */
function loadEnvLocal(): void {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvLocal();

function hasE2eSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    Boolean(url && anon) &&
    !url.includes("ci-placeholder") &&
    !anon.startsWith("ci-placeholder-")
  );
}

const hasE2eSupabase = hasE2eSupabaseEnv();

const baseURL = process.env.APP_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : "list",
  timeout: 15000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL,
    navigationTimeout: 15000,
    actionTimeout: 10000,
    trace: "on-first-retry",
  },
  projects: [
    ...(hasE2eSupabase
      ? [
          {
            name: "setup",
            testMatch: /auth\.setup\.ts/,
          },
        ]
      : []),
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      ...(hasE2eSupabase ? { dependencies: ["setup"] as const } : {}),
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      ...(hasE2eSupabase ? { dependencies: ["setup"] as const } : {}),
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
