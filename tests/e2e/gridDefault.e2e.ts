import { expect, test, type Page } from "@playwright/test";

const CITY = "city=Paris&lat=48.8566&lng=2.3522";
const CITY_URL = `/climate-statistics?${CITY}`;
const PERIODS_URL = `/compare-periods?${CITY}`;
const DATA_REQUEST = /\/api\/worldclim\/pixelvaluesofapoint\?/;

/** The grids the page's point requests ask for, as `10m` … `30s`. */
function recordGrids(page: Page) {
  const grids = new Set<string>();
  page.on("request", (request) => {
    if (!DATA_REQUEST.test(request.url())) return;
    const grid = new URL(request.url()).searchParams.get("grid");
    if (grid) grids.add(grid.replace(/^.*Grid_/, ""));
  });
  return grids;
}

const resolutionTrigger = (page: Page) =>
  page
    .locator("aside")
    .getByText("Cell resolution", { exact: true })
    .locator("xpath=ancestor-or-self::*[following-sibling::div][1]/following-sibling::div[1]")
    .locator("button")
    .first();

async function pickInSidebar(page: Page, label: string, value: string) {
  const dropdown = page
    .locator("aside")
    .getByText(label, { exact: true })
    .locator("xpath=ancestor-or-self::*[following-sibling::div][1]/following-sibling::div[1]");
  await dropdown.locator("button").first().click();
  await dropdown.locator(`button[data-value="${value}"]`).click();
  await page.getByRole("button", { name: "Apply filters" }).click();
}

const gridParam = (page: Page) => new URL(page.url()).searchParams.get("grid");

test.describe("the default resolution: the finest the period offers", () => {
  test("City Climate opens 1970–2000 at 30″, with no grid in the URL", async ({ page }) => {
    const grids = recordGrids(page);
    await page.goto(CITY_URL);
    await expect(resolutionTrigger(page)).toHaveText(/30 sec/, { timeout: 30_000 });
    await expect.poll(() => grids.has("30s"), { timeout: 30_000 }).toBe(true);
    expect(gridParam(page)).toBeNull();
  });

  test("City Climate opens 1991–2020 at 2.5′", async ({ page }) => {
    const grids = recordGrids(page);
    await page.goto(`${CITY_URL}&period=c1991-2020`);
    await expect(resolutionTrigger(page)).toHaveText(/2\.5 min/, { timeout: 30_000 });
    // * (30″ is asked for too: whether 1970–2000, which would open at it, has data here)
    await expect.poll(() => grids.has("2.5m"), { timeout: 30_000 }).toBe(true);
  });

  test("with none chosen it follows the period: 30″ → 2.5′ → 30″", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(resolutionTrigger(page)).toHaveText(/30 sec/, { timeout: 30_000 });

    await pickInSidebar(page, "Climate period", "c1991-2020");
    await expect(page).toHaveURL(/period=c1991-2020/);
    await expect(resolutionTrigger(page)).toHaveText(/2\.5 min/);
    expect(gridParam(page)).toBeNull();

    await pickInSidebar(page, "Climate period", "c1970-2000");
    await expect(page).not.toHaveURL(/period=/);
    await expect(resolutionTrigger(page)).toHaveText(/30 sec/);
    expect(gridParam(page)).toBeNull();
  });

  test("a chosen resolution is kept across periods, a coarser one too", async ({ page }) => {
    const grids = recordGrids(page);
    await page.goto(CITY_URL);
    await expect(resolutionTrigger(page)).toHaveText(/30 sec/, { timeout: 30_000 });

    await pickInSidebar(page, "Cell resolution", "10m");
    await expect(page).toHaveURL(/grid=10m/);
    await pickInSidebar(page, "Climate period", "c1991-2020");
    await expect(page).toHaveURL(/period=c1991-2020/);
    expect(gridParam(page)).toBe("10m");
    await expect(resolutionTrigger(page)).toHaveText(/10 min/);
    await pickInSidebar(page, "Climate period", "c1970-2000");
    await expect(page).not.toHaveURL(/period=/);
    expect(gridParam(page)).toBe("10m");
    await expect.poll(() => grids.has("10m"), { timeout: 30_000 }).toBe(true);
  });

  test("Compare Periods opens at 2.5′: 30″ isn't offered for a pair", async ({ page }) => {
    const grids = recordGrids(page);
    await page.goto(PERIODS_URL);
    await expect(resolutionTrigger(page)).toHaveText(/2\.5 min/, { timeout: 30_000 });
    await expect.poll(() => grids.has("2.5m"), { timeout: 30_000 }).toBe(true);
    expect(grids.has("30s")).toBe(false);
    await resolutionTrigger(page).click();
    await expect(page.locator('aside button[data-value="30s"]')).toBeDisabled();
  });

  test("a URL naming a resolution keeps it", async ({ page }) => {
    const grids = recordGrids(page);
    await page.goto(`${CITY_URL}&grid=5m`);
    await expect(resolutionTrigger(page)).toHaveText(/5 min/, { timeout: 30_000 });
    await expect.poll(() => grids.has("5m"), { timeout: 30_000 }).toBe(true);
    // * the canonical replace leaves the choice in place
    await page.waitForTimeout(500);
    expect(gridParam(page)).toBe("5m");
  });
});
