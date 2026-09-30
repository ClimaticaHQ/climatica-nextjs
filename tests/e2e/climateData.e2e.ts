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

  test("opens Walter-Lieth by default, without a chart param", async ({ page }) => {
    await page.goto(PARIS_URL);
    const chart = page.getByTestId("climate-chart");
    await expect(chart.getByRole("heading", { name: "Paris" })).toBeVisible({ timeout: 30_000 });
    await expect(chart.getByRole("button", { name: "Walter-Lieth diagram" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(new URL(page.url()).searchParams.has("chart")).toBe(false);
  });

  test("chart=standard opens the standard chart", async ({ page }) => {
    await page.goto(`${PARIS_URL}&chart=standard`);
    const chart = page.getByTestId("climate-chart");
    await expect(chart.getByRole("heading", { name: "Paris" })).toBeVisible({ timeout: 30_000 });
    await expect(chart.getByRole("button", { name: "Standard chart" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  // * regression: an unresolved Wikidata label with no description emptied the whole title block
  for (const chart of ["", "&chart=standard"]) {
    test(`always titles the card with the place${chart ? " (standard chart)" : ""}`, async ({
      page,
    }) => {
      await page.goto(`/climate-statistics?city=Q12345&lat=49.8397&lng=24.0297${chart}`);
      const card = page.getByTestId("climate-chart");
      await expect(card.getByRole("heading", { name: "49.8397°N, 24.0297°E" })).toBeVisible({
        timeout: 30_000,
      });
      await expect(card.getByText(/1970–2000/).first()).toBeVisible();
    });
  }

  // * the monthly values table under every chart: °C and mm rows, twelve values each
  test("shows a two-row monthly values table under the city chart", async ({ page }) => {
    await page.goto(PARIS_URL);
    const table = page.getByTestId("climate-chart").getByRole("table");
    await expect(table.getByRole("rowheader")).toHaveCount(2, { timeout: 30_000 });
    for (const row of await table.locator("tbody tr").all()) {
      await expect(row.getByRole("cell").filter({ hasText: /\S/ })).toHaveCount(12);
    }
  });

  test("shows a monthly values table under each compare split panel", async ({ page }) => {
    await page.goto(COMPARE_CITIES_URL);
    const tables = page.getByRole("table", { name: /^Monthly values: / });
    await expect(tables).toHaveCount(2, { timeout: 30_000 });
    for (const table of await tables.all()) {
      const rows = table.locator("tbody tr");
      await expect(rows).toHaveCount(2);
      for (const row of await rows.all()) {
        await expect(row.getByRole("cell").filter({ hasText: /\S/ })).toHaveCount(12);
      }
    }
  });

  test("explains the Walter-Lieth diagram in a popover that Escape closes", async ({ page }) => {
    await page.goto(PARIS_URL);
    const button = page.getByRole("button", { name: "How to read this diagram" });
    await button.click({ timeout: 30_000 });
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("dialog", { name: "How to read this diagram" })).toContainText(
      "10 °C = 20 mm",
    );
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });
});
