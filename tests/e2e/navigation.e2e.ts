import { expect, test } from "@playwright/test";

test.describe("Navigation", () => {
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
