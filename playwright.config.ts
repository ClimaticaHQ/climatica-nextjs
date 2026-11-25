import { defineConfig, devices } from "@playwright/test";
import { E2E_GA_ID, REAL_GTAG_TAG } from "./tests/e2e/analytics.constant";

// * E2E_SERVER=prod (test:e2e:prod): a fresh production build on its own port, never a reused
// * dev server — first load, hydration and streaming behave as deployed
const isProd = process.env["E2E_SERVER"] === "prod";
const DEV_PORT = "3000";
const PROD_PORT = "3100";
const PROD_SERVER_TIMEOUT_MS = 300_000;
const DEV_SERVER_TIMEOUT_MS = 120_000;
const PORT = process.env["PORT"] ?? (isProd ? PROD_PORT : DEV_PORT);
const baseURL = `http://localhost:${PORT}`;
// * Google Analytics needs its ID at build time, so the tests with analytics on get a dev
// * server of their own, built apart (next.config: NEXT_DIST_DIR); every other server has none
const ANALYTICS_PORT = "3001";
const ANALYTICS_URL = `http://localhost:${ANALYTICS_PORT}`;
const ANALYTICS_TEST_FILE = "analytics.e2e.ts";
// * the dev servers started here run without Turbopack's file cache (next.config.ts)
const E2E_DEV_ENV = { NEXT_DEV_FILE_CACHE: "off" };

// * npm run test:e2e:analytics: the opt-in real-gtag group, on the analytics server only
const isRealGtagOnly = Boolean(process.env["E2E_REAL_GTAG"]);
const MAIN_SERVER = {
  command: isProd ? `npm run build && npx next start -p ${PORT}` : "npm run dev",
  url: baseURL,
  reuseExistingServer: !process.env["CI"] && !isProd,
  timeout: isProd ? PROD_SERVER_TIMEOUT_MS : DEV_SERVER_TIMEOUT_MS,
  // * empty, not unset: an empty value wins over .env.production's ID in a production build
  env: { PORT, NEXT_PUBLIC_GA_ID: "", ...E2E_DEV_ENV },
};

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
      testIgnore: ANALYTICS_TEST_FILE,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "analytics",
      testMatch: ANALYTICS_TEST_FILE,
      // * the real-gtag group loads gtag.js from Google: only with E2E_REAL_GTAG=1
      ...(isRealGtagOnly ? {} : { grepInvert: new RegExp(REAL_GTAG_TAG) }),
      use: { ...devices["Desktop Chrome"], baseURL: ANALYTICS_URL },
    },
  ],
  webServer: [
    // * not for the real-gtag group alone: it runs only on the analytics server
    ...(isRealGtagOnly ? [] : [MAIN_SERVER]),
    {
      command: `npx next dev -p ${ANALYTICS_PORT}`,
      url: ANALYTICS_URL,
      reuseExistingServer: !process.env["CI"],
      timeout: DEV_SERVER_TIMEOUT_MS,
      env: {
        PORT: ANALYTICS_PORT,
        NEXT_PUBLIC_GA_ID: E2E_GA_ID,
        NEXT_DIST_DIR: ".next-analytics",
        ...E2E_DEV_ENV,
      },
    },
  ],
});
