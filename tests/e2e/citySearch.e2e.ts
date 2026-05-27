import { expect, test } from "@playwright/test";

test.describe("City search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/climate-statistics");
  });

  test("shows the correct placeholder text", async ({ page }) => {
    const input = page.getByTestId("city-search-input").first();
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute(
      "placeholder",
      "Search city or enter coordinates (lat, lng)...",
    );
  });

  test("displays results dropdown when typing a city name", async ({ page }) => {
    const input = page.getByTestId("city-search-input").first();
    await input.fill("Paris");
    const results = page.getByTestId("city-search-results").first();
    await expect(results).toBeVisible();
    await expect(results.getByRole("button").first()).toBeVisible();
  });

  test("selecting a result updates the input and closes the dropdown", async ({ page }) => {
    const input = page.getByTestId("city-search-input").first();
    await input.fill("Paris");
    const results = page.getByTestId("city-search-results").first();
    await expect(results).toBeVisible();
    const firstButton = results.getByRole("button").first();
    const cityName = await firstButton.locator("span").first().textContent();
    await firstButton.click();
    await expect(input).toHaveValue(cityName ?? "");
    await expect(results).not.toBeVisible();
  });

  test("selecting a result updates the URL with lat and lng params", async ({ page }) => {
    const input = page.getByTestId("city-search-input").first();
    await input.fill("Paris");
    const results = page.getByTestId("city-search-results").first();
    await expect(results).toBeVisible();
    await results.getByRole("button").first().click();
    await expect(page).toHaveURL(/lat=.+&lng=.+|lng=.+&lat=.+/);
  });

  test("parses coordinate input and shows a coordinate result", async ({ page }) => {
    const input = page.getByTestId("city-search-input").first();
    await input.fill("48.85, 2.35");
    const results = page.getByTestId("city-search-results").first();
    await expect(results).toBeVisible();
    await expect(results.getByText("Go to coordinates")).toBeVisible();
  });

  test("closes the results dropdown when clicking outside", async ({ page }) => {
    const input = page.getByTestId("city-search-input").first();
    await input.fill("Paris");
    const results = page.getByTestId("city-search-results").first();
    await expect(results).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click();
    await expect(results).not.toBeVisible();
  });

  test("does not show results for a single-character query", async ({ page }) => {
    const input = page.getByTestId("city-search-input").first();
    await input.fill("P");
    // Allow debounce (400ms) to fire before asserting no results
    await page.waitForTimeout(600);
    await expect(page.getByTestId("city-search-results").first()).not.toBeVisible();
  });
});
