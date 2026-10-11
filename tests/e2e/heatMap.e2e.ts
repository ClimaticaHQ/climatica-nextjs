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

  // * regression: WorldClim stops at 10,000 rows per request, so a region past ~830 cells lost
  // * the rest; it now loads as strips
  test("a region larger than one request loads every cell", async ({ page }) => {
    await page.goto(
      "/heat-map?dataset=climate&period=c1970-2000&grid=10m&var=tmax&north=50&south=45&west=20&east=26",
    );
    const stats = page.getByTestId("region-stats");
    await expect(stats.getByText("1,080", { exact: true })).toBeVisible({ timeout: 60_000 });
  });

  test("a region over the cell cap suggests a coarser resolution", async ({ page }) => {
    await page.goto(
      "/heat-map?dataset=climate&period=c1970-2000&grid=2.5m&var=tmax&north=50&south=47&west=20&east=23",
    );
    await expect(page.getByText(/Choose 5 min or a coarser resolution/)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("region-stats")).toHaveCount(0);
  });

  test("drawing a box shows its live cell count, a warning past the cap", async ({ page }) => {
    // * 30 s: most of the opening view (about 1° × 0.6°) holds past the cap of 2,000 cells
    await page.goto("/heat-map?dataset=climate&period=c1970-2000&grid=30s&var=tmax");
    await page.getByRole("button", { name: "Draw bounding box" }).click();
    const map = page.locator(".leaflet-container");
    await map.scrollIntoViewIfNeeded();
    const box = await map.boundingBox();
    if (!box) throw new Error("no map");
    const start = { x: box.x + 100, y: box.y + 100 };

    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 30, start.y + 30, { steps: 5 });
    const count = page.locator(".drawing-cell-count");
    await expect(count).toContainText(/Fast\s*\([1-9][\d,]* cells\)/);

    await page.mouse.move(start.x + 600, start.y + 380, { steps: 10 });
    await expect(count).toContainText("Too many cells");
    await page.mouse.up();
    await expect(count).toHaveCount(0);
  });
});
