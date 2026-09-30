import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
  // * a flaky pass here hides a real race (a stale URL write cancelling the click), so never retry
  test.describe.configure({ retries: 0 });

  test("nav links navigate to the correct pages", async ({ page }) => {
    await page.goto("/climate-statistics");

    await page.getByRole("link", { name: "Compare Cities" }).click();
    await expect(page).toHaveURL(/compare-cities/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Cities");

    await page.getByRole("link", { name: "Compare Periods" }).click();
    await expect(page).toHaveURL(/compare-periods/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Periods");

    await page.getByRole("link", { name: "Region Heatmap" }).click();
    await expect(page).toHaveURL(/heat-map/);

    await page.getByRole("link", { name: "City Climate" }).click();
    await expect(page).toHaveURL(/climate-statistics/);
  });

  test("back restores the previous page's URL and state", async ({ page }) => {
    await page.goto("/climate-statistics?city=Paris&lat=48.8566&lng=2.3522");
    const chart = page.getByTestId("climate-chart");
    await expect(chart.getByRole("heading", { name: "Paris" })).toBeVisible({ timeout: 30_000 });

    // * one page-only field and one shared filter (months — enabled on the standard chart),
    // * both written to the URL by the sync
    await chart.getByRole("button", { name: "Standard chart" }).click();
    await page.getByRole("button", { name: "Jul", exact: true }).click();
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/chart=standard/);
    await expect(page).not.toHaveURL(/months=all/);
    const filteredUrl = page.url();

    await page.getByRole("link", { name: "Compare Cities" }).click();
    await expect(page).toHaveURL(/compare-cities/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Cities");

    await page.goBack();
    await expect(chart.getByRole("heading", { name: "Paris" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Jul", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(chart.getByRole("button", { name: "Standard chart" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // * after the restored page has settled, no late write has replaced its entry
    await expect(chart.getByRole("button", { name: "Standard chart" })).toBeVisible();
    expect(page.url()).toBe(filteredUrl);
  });

  test("compare cities page renders two city search inputs", async ({ page }) => {
    await page.goto("/compare-cities");
    await expect(page.getByTestId("city-search-input")).toHaveCount(2);
  });

  test("compare periods page renders with the correct heading", async ({ page }) => {
    await page.goto("/compare-periods");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Periods");
  });

  test("shows 404 page for unknown route", async ({ page }) => {
    await page.goto("/uk/this-page-does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("404");
    await expect(page.getByTestId("not-found-home-link")).toBeVisible();
  });

  test("404 page has working link to home", async ({ page }) => {
    await page.goto("/uk/this-page-does-not-exist");
    await page.getByTestId("not-found-home-link").click();
    await expect(page).toHaveURL(/climate-statistics/);
  });
});
