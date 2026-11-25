import { expect, test } from "@playwright/test";

// * the usual servers have no GA ID (playwright.config.ts): no analytics anywhere
const GOOGLE = /^https:\/\/([a-z0-9-]+\.)*(googletagmanager|google-analytics)\.com\//;

test("without a GA ID: no banner, no Settings row, no Cookie settings, no Google requests", async ({
  page,
  context,
}) => {
  const requests: string[] = [];
  await context.route(GOOGLE, (route) => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.goto("/about");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("region", { name: "Analytics consent" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cookie settings" })).toHaveCount(0);
  await expect(page.locator("#privacy")).toContainText("Google Analytics only if you accept");

  await page.goto("/settings");
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Appearance" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Privacy" })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: /^Analytics/ })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Analytics consent" })).toHaveCount(0);
  expect(requests).toEqual([]);
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
});
