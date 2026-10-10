import { expect, test } from "@playwright/test";

// * a 1° box over Lviv: 6 × 6 cells at 10′
const BOX = "north=50&south=49&west=23&east=24&grid=10m&var=tmax";
const CELL_COUNT = "36";

test.describe("Region Heatmap", () => {
  // * regression: the API stops at 100 rows unless asked for more, and a Climate box returns
  // * every normals period — the selected one went missing and its stats never loaded
  test("a Climate box from the URL shows the region's stats", async ({ page }) => {
    await page.goto(`/heat-map?dataset=climate&period=c1970-2000&${BOX}`);
    const stats = page.getByTestId("region-stats");
    await expect(stats.getByText("°C").first()).toBeVisible({ timeout: 30_000 });
    await expect(stats.getByText(CELL_COUNT, { exact: true })).toBeVisible();
    await expect(page.getByText(/No .* data at/)).toHaveCount(0);
  });

  test("a Weather box from the URL shows every stat and the cell count", async ({ page }) => {
    await page.goto(`/heat-map?dataset=weather&year=2024&${BOX}`);
    const stats = page.getByTestId("region-stats");
    await expect(stats.getByText(CELL_COUNT, { exact: true })).toBeVisible({ timeout: 30_000 });
    for (const label of ["Min", "Max", "Average", "Median", "Std dev", "Cells"]) {
      await expect(stats.getByText(label, { exact: true })).toBeVisible();
    }
    await expect(stats.getByText(/°C/)).toHaveCount(5);
    await expect(stats.locator(".animate-pulse")).toHaveCount(0);
  });
});
