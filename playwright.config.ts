import { defineConfig, devices } from "@playwright/test";

const PORT = process.env["PORT"] ?? "3000";
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
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
    env: { PORT },
  },
});
