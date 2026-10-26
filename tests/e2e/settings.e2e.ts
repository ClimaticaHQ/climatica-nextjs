import { devices, expect, test, type Page } from "@playwright/test";

const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
const COMPARE_URL =
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522&layout=overlay&chart=standard&dataset=weather";

const FIVE_YEARS_URL =
  "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038&dataset=weather&periods=2021,1967,1990,2010,2000&layout=overlay&chart=standard";

const settingsHeading = (page: Page) => page.getByRole("heading", { level: 1, name: "Settings" });
const barStyleGroup = (page: Page) =>
  page.getByRole("radiogroup", { name: "Comparison bar style" });
// * the overlay's bars: their fills (shades are tokens of their own) and their hatches
const overlayBars = (page: Page) =>
  page.evaluate(() => {
    const bars = [
      ...document.querySelectorAll(".recharts-bar-rectangle rect:not([data-bar-hatch])"),
    ];
    return {
      count: bars.length,
      shaded: bars.filter((bar) => bar.getAttribute("fill")?.includes("-shade-")).length,
      hatches: document.querySelectorAll(".recharts-bar-rectangle rect[data-bar-hatch]").length,
    };
  });

test.describe("Settings page", () => {
  test("the gear opens it, marked as the current page; no filters there", async ({ page }) => {
    await page.goto(CITY_URL);
    const gear = page.getByRole("link", { name: "Settings" });
    await gear.click();

    await expect(settingsHeading(page)).toBeVisible();
    await expect(page).toHaveURL(/\/settings(\?|$)/);
    await expect(gear).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("complementary", { name: "Filters" })).toHaveCount(0);
    await expect(page.getByText("Language, appearance and how the app behaves")).toBeVisible();
  });

  test("Back returns to the previous page with its exact state", async ({ page }) => {
    await page.goto(COMPARE_URL);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Cities");
    const before = page.url();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(settingsHeading(page)).toBeVisible();
    // * the shared filters ride along, so the navbar's links from settings keep them
    expect(new URL(page.url()).searchParams.get("dataset")).toBe("weather");

    await page.goBack();
    await expect(page).toHaveURL(before);
    const chart = page.getByTestId("climate-chart");
    await expect(chart.getByRole("button", { name: "Overlay", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
      { timeout: 30_000 },
    );
  });

  test("a dark theme survives a reload — set before any script of the app runs", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/settings");
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    // * no app bundle at all: only the inline head script can have set the class — so the
    // * first paint is already dark, never a light flash
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.goto(CITY_URL, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });

  test("system follows the device, and changes with it", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test("animations off applies on a chart page", async ({ page }) => {
    await page.goto("/settings");
    await page.getByText("Animations", { exact: true }).click();

    await page.goto(CITY_URL);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  });

  test("auto-apply off: a filter waits for Apply on a chart page", async ({ page }) => {
    await page.goto("/settings");
    await page.getByText("Auto-apply filters", { exact: true }).click();

    await page.goto(CITY_URL);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("button", { name: "Weather", exact: true }).click();
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).searchParams.get("dataset")).toBeNull();

    await sidebar.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/dataset=weather/);
  });
});

test.describe("Comparison bar style", () => {
  test("chips show a bar swatch only where the view draws each year's bars", async ({ page }) => {
    const chips = page.locator("[data-toolbar-chips]");
    const swatches = chips.locator("[data-series-hatch]");

    // * Walter-Lieth draws no bars: the shapes alone, even with Patterns set
    await page.goto("/settings");
    await barStyleGroup(page).getByRole("radio", { name: "Patterns" }).click();
    await page.goto(FIVE_YEARS_URL.replace("&chart=standard", "&chart=walter-lieth"));
    await expect(chips.getByRole("button")).toHaveCount(5, { timeout: 30_000 });
    await expect(swatches).toHaveCount(0);

    // * the standard overlay with Patterns: each year's hatch beside its shape
    await page.getByTestId("climate-chart").getByRole("button", { name: "Standard chart" }).click();
    await expect(page).toHaveURL(/chart=standard/);
    await expect(swatches).toHaveCount(5);
    expect(
      new Set(
        await swatches.evaluateAll((icons) =>
          icons.map((icon) => icon.getAttribute("data-series-hatch")),
        ),
      ),
    ).toEqual(new Set(["solid", "diagonal", "dots", "horizontal", "cross"]));
  });

  test("plain by default; a pick changes Compare Periods' bars and survives a reload", async ({
    page,
  }) => {
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect.poll(async () => (await overlayBars(page)).count).toBeGreaterThan(0);
    expect(await overlayBars(page)).toMatchObject({ shaded: 0, hatches: 0 });

    await page.goto("/settings");
    const group = barStyleGroup(page);
    await expect(group.getByRole("radio", { name: "Uniform" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await group.getByRole("radio", { name: "Shades" }).click();
    await expect(group.getByRole("radio", { name: "Shades" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect
      .poll(async () => {
        const bars = await overlayBars(page);
        return bars.count > 0 && bars.shaded === bars.count && bars.hatches === 0;
      })
      .toBe(true);

    await page.reload();
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect
      .poll(async () => {
        const bars = await overlayBars(page);
        return bars.count > 0 && bars.shaded === bars.count;
      })
      .toBe(true);

    // * the keyboard: the arrow moves the selection on to Patterns
    await page.goto("/settings");
    await barStyleGroup(page).getByRole("radio", { name: "Shades" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(barStyleGroup(page).getByRole("radio", { name: "Patterns" })).toBeFocused();
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect.poll(async () => (await overlayBars(page)).hatches).toBeGreaterThan(0);
    expect((await overlayBars(page)).shaded).toBe(0);
  });

  test("on desktop the cards sit right of the label, the selected one ringed", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/settings");
    const label = page.getByText("Comparison bar style", { exact: true });
    const group = barStyleGroup(page);
    const [labelBox, groupBox] = [await label.boundingBox(), await group.boundingBox()];
    expect(groupBox!.x).toBeGreaterThan(labelBox!.x + labelBox!.width);
    await expect(group.locator("[data-selection-indicator]").first()).toBeHidden();
  });
});

test.describe("Settings page on a phone", () => {
  test.use({ viewport: devices["Pixel 7"].viewport });

  test("the menu's Settings item opens it; no theme button in the top bar", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(0);

    await page.getByRole("button", { name: "Toggle menu" }).click();
    await page.getByRole("link", { name: "Settings" }).click();

    await expect(settingsHeading(page)).toBeVisible();
    await expect(page.getByTestId("language-switcher")).toBeVisible();
  });

  test("the bar style cards sit under the label, centred, with selection indicators", async ({
    page,
  }) => {
    await page.goto("/settings");
    const label = page.getByText("Comparison bar style", { exact: true });
    const group = barStyleGroup(page);
    await group.scrollIntoViewIfNeeded();
    const [labelBox, groupBox] = [await label.boundingBox(), await group.boundingBox()];
    expect(groupBox!.y).toBeGreaterThan(labelBox!.y + labelBox!.height);
    const row = await group.evaluate((element) => {
      const parent = element.closest("[class*='flex-col']")?.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return parent ? { left: box.left - parent.left, right: parent.right - box.right } : null;
    });
    expect(Math.abs(row!.left - row!.right)).toBeLessThan(2);

    const indicators = group.locator("[data-selection-indicator]");
    await expect(indicators).toHaveCount(3);
    await expect(indicators.first()).toBeVisible();
    await expect(indicators.nth(0).locator("svg")).toHaveCount(1);
    await expect(indicators.nth(1).locator("svg")).toHaveCount(0);
    await group.getByRole("radio", { name: "Patterns" }).click();
    await expect(indicators.nth(2).locator("svg")).toHaveCount(1);
    await expect(indicators.nth(0).locator("svg")).toHaveCount(0);
  });
});
