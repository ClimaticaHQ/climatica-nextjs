import { expect, test } from "@playwright/test";

const PARIS_URL = "/climate-statistics?lat=48.8566&lng=2.3522&city=Paris";
const COMPARE_CITIES_URL =
  "/compare-cities?latA=48.8566&lngA=2.3522&cityA=Paris&latB=51.5074&lngB=-0.1278&cityB=London";

test.describe("Climate data loading", () => {
  test("loads stat cards for a city via URL params", async ({ page }) => {
    await page.goto(PARIS_URL);
    await expect(page.getByTestId("stat-cards")).toBeVisible({ timeout: 30_000 });
  });

  test("stat cards show temperature values with °C unit", async ({ page }) => {
    await page.goto(PARIS_URL);
    const statCards = page.getByTestId("stat-cards");
    await expect(statCards).toBeVisible({ timeout: 30_000 });
    await expect(statCards.getByText("°C").first()).toBeVisible();
  });

  test("chart container is visible after data loads", async ({ page }) => {
    await page.goto(PARIS_URL);
    await expect(page.getByTestId("stat-cards")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("climate-chart")).toBeVisible();
  });

  test("compare cities page loads and displays data for both cities", async ({ page }) => {
    await page.goto(COMPARE_CITIES_URL);
    // Both city labels appear as column headers in CompareStatsGrid
    await expect(page.getByText("Paris").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("London").first()).toBeVisible({ timeout: 30_000 });
    // Export menu appears only once data is loaded
    await expect(page.getByRole("button", { name: /Export/i })).toBeVisible({ timeout: 30_000 });
  });
});
