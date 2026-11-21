import { expect, test, type Page } from "@playwright/test";

const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
const PAIR_URL =
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=London&latB=51.5074&lngB=-0.1278";
// * the default views a chart page opens in, each with the plots its skeleton stands in for
const CHART_VIEWS = [
  { name: "City Climate, Walter-Lieth", url: CITY_URL },
  { name: "City Climate, standard", url: `${CITY_URL}&chart=standard` },
  { name: "Compare Cities, overlay", url: `${PAIR_URL}&layout=overlay` },
  { name: "Compare Cities, side by side", url: `${PAIR_URL}&layout=split` },
  {
    name: "Compare Periods, overlay",
    url: "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038&layout=overlay",
  },
];
const WIDTHS = [390, 1440];
const CLS_LIMIT = 0.02;
// * long enough for the data and the charts to land, and any late shift to be counted
const SETTLE_MS = 2500;
const POLL = { intervals: [300], timeout: 10_000 };

const chartSection = (page: Page) => page.getByTestId("climate-chart");
const readBoxes = (page: Page, selector: string) =>
  page.locator(`[data-testid=climate-chart] ${selector}`).evaluateAll((elements) =>
    elements.map((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    }),
  );
// * the boxes once the section has settled: no crossfade's leaving layer (inert), and the same
// * boxes twice in a row
const boxesOf = async (page: Page, selector: string) => {
  let previous = "";
  await expect
    .poll(async () => {
      const current = (await chartSection(page).locator("[inert]").count())
        ? ""
        : JSON.stringify(await readBoxes(page, selector));
      const isSettled = current !== "" && current === previous;
      previous = current;
      return isSettled;
    }, POLL)
    .toBe(true);
  return readBoxes(page, selector);
};

/** Holds every WorldClim request until the returned function is called. */
async function holdChartData(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/api/worldclim/**", async (route) => {
    await gate;
    await route.continue();
  });
  return release;
}

/** The page's cumulative layout shift, counted from the first paint (none after input). */
async function trackLayoutShift(page: Page) {
  await page.addInitScript(() => {
    const target = window as Window & { __cls?: number };
    target.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) target.__cls = (target.__cls ?? 0) + shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const layoutShiftOf = (page: Page) =>
  page.evaluate(() => (window as Window & { __cls?: number }).__cls ?? 0);

test.describe("Loading without jumps", () => {
  test("the Info navigation is in the server's HTML", async ({ request }) => {
    const html = await (await request.get("/about/guide")).text();
    expect(html).toMatch(/<nav aria-label="Info pages"/);
    expect(html).toContain('aria-current="page"');
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });

    test("the Info navigation shows from lg before any hydration", async ({ page }) => {
      await page.goto("/about");
      const nav = page.getByRole("navigation", { name: "Info pages" });
      await expect(nav).toBeVisible();
      await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  for (const width of WIDTHS) {
    for (const url of ["/about", CITY_URL]) {
      test(`reloading ${url} at ${width}px shifts nothing (CLS < ${CLS_LIMIT})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await trackLayoutShift(page);
        await page.goto(url);
        await page.reload();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(SETTLE_MS);
        expect(await layoutShiftOf(page)).toBeLessThan(CLS_LIMIT);
      });
    }
  }

  test("while the data load, City Climate shows ChartSkeleton, busy, at the chart's size", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const release = await holdChartData(page);
    await page.goto(CITY_URL);
    await expect(chartSection(page)).toHaveAttribute("aria-busy", "true");
    await expect(chartSection(page).getByText("Loading chart")).toBeAttached();
    const skeleton = chartSection(page).locator("[data-chart-skeleton]");
    await expect(skeleton).toHaveCount(1);
    await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    const [loading] = await boxesOf(page, "[data-chart-skeleton]");
    release();
    await expect(chartSection(page)).toHaveAttribute("aria-busy", "false");
    await expect(skeleton).toHaveCount(0);
    const [ready] = await boxesOf(page, "[data-chart-plot]");
    expect(Math.abs((loading?.height ?? 0) - (ready?.height ?? -1))).toBeLessThanOrEqual(1);
    expect(Math.abs((loading?.width ?? 0) - (ready?.width ?? -1))).toBeLessThanOrEqual(1);
  });

  for (const width of WIDTHS) {
    for (const { name, url } of CHART_VIEWS) {
      test(`${name} at ${width}px: each skeleton is its plot's size`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const release = await holdChartData(page);
        await page.goto(url);
        await expect(chartSection(page)).toHaveAttribute("aria-busy", "true");
        const loading = await boxesOf(page, "[data-chart-skeleton]");
        release();
        await expect(chartSection(page)).toHaveAttribute("aria-busy", "false");
        await expect(chartSection(page).locator("[data-chart-skeleton]")).toHaveCount(0);
        const ready = await boxesOf(page, "[data-chart-plot]");
        expect(loading).toHaveLength(ready.length);
        loading.forEach((box, index) => {
          expect(Math.abs(box.height - (ready[index]?.height ?? -1))).toBeLessThanOrEqual(1);
          expect(Math.abs(box.width - (ready[index]?.width ?? -1))).toBeLessThanOrEqual(1);
        });
      });
    }
  }

  test("a values table opened while the data load stays open when they land", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const release = await holdChartData(page);
    await page.goto(CITY_URL);
    await expect(chartSection(page)).toHaveAttribute("aria-busy", "true");
    await chartSection(page).getByRole("button", { name: "Show monthly values" }).click();
    const table = chartSection(page).getByRole("table", { name: /^Monthly values: / });
    await expect(table).toBeVisible();
    release();
    await expect(chartSection(page)).toHaveAttribute("aria-busy", "false");
    await expect(chartSection(page).locator("[data-chart-skeleton]")).toHaveCount(0);
    await expect(table).toBeVisible();
    await expect(
      chartSection(page).getByRole("button", { name: "Hide monthly values" }),
    ).toBeVisible();
    // * and it now holds the values
    await expect(
      table.locator("tbody tr").first().getByRole("cell").filter({ hasText: /\d/ }),
    ).not.toHaveCount(0);
  });

  test("figure numbers: a primary disc, white digits, about 20px, text from 14px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about/data");
    await expect(page.locator("[data-annotation-number]").first()).toBeAttached();
    const numbers = await page.evaluate(() => {
      const colourOf = (token: string) => {
        const probe = document.createElement("div");
        probe.style.color = `var(${token})`;
        document.body.append(probe);
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      };
      const size = (element: Element) => Math.round(element.getBoundingClientRect().width);
      return {
        primary: colourOf("--color-primary"),
        onPrimary: colourOf("--color-on-primary"),
        // * the plot band's discs (SVG) and the stats cells' and caption's markers (HTML)
        discs: [...document.querySelectorAll("[data-annotation-number]")].map((number) => ({
          fill: getComputedStyle(number.querySelector("circle")!).fill,
          text: getComputedStyle(number.querySelector("text")!).fill,
          font: parseFloat(getComputedStyle(number.querySelector("text")!).fontSize),
          size: size(number.querySelector("circle")!),
        })),
        markers: [...document.querySelectorAll("[data-figure-marker]")].map((marker) => ({
          fill: getComputedStyle(marker).backgroundColor,
          text: getComputedStyle(marker).color,
          font: parseFloat(getComputedStyle(marker).fontSize),
          size: size(marker),
        })),
      };
    });
    expect(numbers.discs.length).toBeGreaterThan(0);
    expect(numbers.markers.length).toBeGreaterThan(0);
    for (const { fill, text, font, size } of [...numbers.discs, ...numbers.markers]) {
      expect(fill).toBe(numbers.primary);
      expect(text).toBe(numbers.onPrimary);
      expect(font).toBeGreaterThanOrEqual(14);
      expect(Math.abs(size - 20)).toBeLessThanOrEqual(2);
    }
  });
});
