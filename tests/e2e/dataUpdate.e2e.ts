import { expect, test, type Page } from "@playwright/test";

const DATA_ROUTE = "**/api/worldclim/pixelvaluesofapoint**";
// * long enough past the loading delay for the loading state to be observed
const SLOW_RESPONSE_MS = 1500;
const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522&dataset=climate&grid=10m";
const PERIODS_URL =
  "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038&dataset=climate&period1=c1970-2000&period2=c1991-2020";

/** Picks an option in the sidebar dropdown that follows the given label, then applies. */
async function applySidebarOption(page: Page, label: string | RegExp, value: string) {
  const dropdown = page
    .locator("aside")
    .getByText(label, { exact: true })
    .locator("xpath=ancestor-or-self::*[following-sibling::div][1]/following-sibling::div[1]");
  await dropdown.locator("button").first().click();
  await dropdown.locator(`button[data-value="${value}"]`).click();
  await page.getByRole("button", { name: "Apply filters" }).click();
}

test.describe("Data update feedback", () => {
  test("disables export while loading, then announces the update", async ({ page }) => {
    await page.goto(CITY_URL);
    const exportButton = page.getByRole("button", { name: "Export data" });
    await expect(exportButton).toBeEnabled({ timeout: 30_000 });

    await page.route(DATA_ROUTE, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, SLOW_RESPONSE_MS));
      await route.continue();
    });
    await applySidebarOption(page, "Cell resolution:", "5m");

    await expect(exportButton).toBeDisabled();
    await expect(page.locator("[data-update-progress]")).toBeVisible();
    await expect(page.locator("[aria-live=polite]")).toHaveText(
      "Data updated: Paris, Climate 1970–2000",
      { timeout: 30_000 },
    );
    await expect(exportButton).toBeEnabled();
    await expect(page.locator("[data-update-progress]")).toHaveCount(0);
  });

  test("flashes only the panel whose series changed", async ({ page }) => {
    await page.goto(PERIODS_URL);
    const panelA = page.locator('[data-panel-series="a"]:not([inert] *)');
    const panelB = page.locator('[data-panel-series="b"]:not([inert] *)');
    await expect(panelB).toBeVisible({ timeout: 30_000 });

    await applySidebarOption(page, "Period B", "c1981-2010");

    await expect(panelB).toHaveAttribute("data-update-flash", "active");
    await expect(panelA).not.toHaveAttribute("data-update-flash");
    await expect(page.locator("[aria-live=polite]")).toHaveText(
      "Data updated: Madrid, 1970–2000, 1981–2010",
    );
  });
});

/** Opens the sidebar's Settings section. */
async function openSettings(page: Page) {
  await page.locator("aside").getByRole("button", { name: "Settings" }).click();
}

/** Records every card that starts an update flash from now on. */
async function recordFlashes(page: Page) {
  await page.evaluate(() => {
    const flashes: string[] = [];
    Object.assign(window, { __flashes: flashes });
    new MutationObserver((mutations) => {
      mutations.forEach(({ target }) => {
        if (target instanceof HTMLElement && target.dataset["updateFlash"]) {
          flashes.push(target.dataset["updateFlashVariant"] ?? "");
        }
      });
    }).observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-update-flash"],
    });
  });
}

test.describe("Animation settings", () => {
  test("animations off: the update still loads and announces, but nothing flashes", async ({
    page,
  }) => {
    await page.goto(CITY_URL);
    await expect(page.getByTestId("stat-cards")).toBeVisible({ timeout: 30_000 });

    await openSettings(page);
    await page.locator("aside").getByText("Animations", { exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    // * the highlight choice only shows while animations are on
    await expect(page.getByRole("button", { name: "Border", exact: true })).toHaveCount(0);

    await recordFlashes(page);
    await page.route(DATA_ROUTE, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, SLOW_RESPONSE_MS));
      await route.continue();
    });
    await applySidebarOption(page, "Cell resolution:", "5m");

    // * the loading state stays visible, only without motion
    await expect(page.locator("[data-update-progress]")).toBeVisible();
    await expect(page.locator("[aria-live=polite]")).toHaveText(
      "Data updated: Paris, Climate 1970–2000",
      { timeout: 30_000 },
    );
    expect(await page.evaluate(() => Reflect.get(window, "__flashes"))).toEqual([]);
    await expect(page.locator("[data-update-flash]")).toHaveCount(0);
  });

  test("Border highlight: the changed panel flashes with the border only", async ({ page }) => {
    await page.goto(PERIODS_URL);
    const panelB = page.locator('[data-panel-series="b"]:not([inert] *)');
    await expect(panelB).toBeVisible({ timeout: 30_000 });

    await openSettings(page);
    await page.getByRole("button", { name: "Border", exact: true }).click();
    await expect(page.getByRole("button", { name: "Border", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await applySidebarOption(page, "Period B", "c1981-2010");

    await expect(panelB).toHaveAttribute("data-update-flash", "active");
    await expect(panelB).toHaveAttribute("data-update-flash-variant", "border");
  });
});
