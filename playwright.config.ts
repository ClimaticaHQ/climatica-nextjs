import { defineConfig, devices } from "@playwright/test";

// * E2E_SERVER=prod (test:e2e:prod): a fresh production build on its own port, never a reused
// * dev server — first load, hydration and streaming behave as deployed
const isProd = process.env["E2E_SERVER"] === "prod";
const DEV_PORT = "3000";
const PROD_PORT = "3100";
const PROD_SERVER_TIMEOUT_MS = 300_000;
const DEV_SERVER_TIMEOUT_MS = 120_000;
const PORT = process.env["PORT"] ?? (isProd ? PROD_PORT : DEV_PORT);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "*.e2e.ts",
  timeout: 30_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env["CI"] ? 1 : 0,
  forbidOnly: !!process.env["CI"],
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL,
    trace: process.env["CI"] ? "on" : "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      args: ["--disable-logging"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: isProd ? `npm run build && npx next start -p ${PORT}` : "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env["CI"] && !isProd,
    timeout: isProd ? PROD_SERVER_TIMEOUT_MS : DEV_SERVER_TIMEOUT_MS,
    env: { PORT },
  },
});
