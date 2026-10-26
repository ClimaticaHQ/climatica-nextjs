import { expect, test } from "@playwright/test";

const PARIS_URL =
  "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522&grid=10m&dataset=climate&chart=standard";

test.describe("Picking a city", () => {
  test.describe.configure({ retries: 0 });

  test("leaves nothing of the previous city: chart, stats, title, export, other pages", async ({
    page,
  }) => {
    await page.goto(PARIS_URL);
    const chart = page.getByTestId("climate-chart");
    const chartTitle = chart.getByRole("heading", { level: 3 });
    await expect(chartTitle).toHaveText("Paris", { timeout: 30_000 });
    const parisStats = await page.getByTestId("stat-cards").innerText();

    const input = page.getByTestId("city-search-input").first();
    await input.fill("Lisbon");
    const results = page.getByTestId("city-search-results").first();
    await expect(results).toBeVisible({ timeout: 15_000 });
    await results.getByRole("button").first().click();

    // * every block of the page describes the new city
    await expect(chartTitle).toContainText("Lisbon", { timeout: 30_000 });
    await expect(page.getByTestId("stat-cards")).not.toHaveText(parisStats, { timeout: 30_000 });
    await expect(chart.locator("caption").first()).toContainText("Lisbon");
    await expect(page).toHaveTitle(/^Lisbon/);
    await expect(page.locator("main")).not.toContainText("Paris");

    // * the export is named after the new city
    await chart.getByRole("button", { name: "Export data" }).click();
    const download = page.waitForEvent("download");
    await chart.getByRole("button", { name: "PNG image" }).click();
    expect((await download).suggestedFilename()).toMatch(/^city-climate-lisbon-/);

    // * synced: the other pages open on it, with its data
    await page.getByRole("link", { name: "Compare Cities" }).click();
    await expect(page.getByRole("heading", { level: 3 }).first()).toContainText("Lisbon", {
      timeout: 30_000,
    });
    await expect(page.locator("main")).not.toContainText("Paris");

    await page.getByRole("link", { name: "Compare Periods" }).click();
    await expect(page.getByRole("heading", { level: 3 }).first()).toHaveText("Lisbon", {
      timeout: 30_000,
    });
    await expect(page.locator("main")).not.toContainText("Paris");
  });
});
