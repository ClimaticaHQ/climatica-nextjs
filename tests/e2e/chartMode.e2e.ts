import { PRECIP_BAR } from "@/constants/chartPlot.constant";
import { LOCAL_STORAGE_KEYS } from "@/constants/localStorageKeys.constant";
import { SERIES_HATCHES, SERIES_SHAPES } from "@/constants/seriesShape.constant";
import { WALTER_LIETH_AXIS } from "@/constants/walterLieth.constant";
import type { TBarStyle } from "@/types";
import { expect, test, type Page } from "@playwright/test";

const PARIS = "city=Paris&lat=48.8566&lng=2.3522";
const CITY_URL = `/climate-statistics?${PARIS}`;
const CITIES_URL =
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522";
const PERIODS_URL = "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038";
const FIVE_YEARS_URL = `${PERIODS_URL}&dataset=weather&periods=2021,1967,1990,2010,2000&layout=overlay&chart=standard`;
const PHONE = { width: 390, height: 900 };
// * five years fit (with the sidebar) from 1121 px in plain (its gap adapts), 1145 px in shades
const DESKTOPS = [
  { viewport: { width: 1280, height: 900 }, barStyle: "plain" },
  { viewport: { width: 1280, height: 900 }, barStyle: "shades" },
  { viewport: { width: 1280, height: 900 }, barStyle: "hatch" },
  { viewport: { width: 1920, height: 1000 }, barStyle: "plain" },
] as const;
const HOVERED_MONTH = 5;
// * the plot's left margin: the °C axis' own width (WALTER_LIETH_AXIS.WIDTH)
const AXIS_WIDTH = WALTER_LIETH_AXIS.WIDTH;
const OVERLAY_URLS = {
  "climate periods": `${PERIODS_URL}&layout=overlay&chart=standard`,
  "five weather years": FIVE_YEARS_URL,
  cities: `${CITIES_URL}&chart=standard&layout=overlay`,
};
// * each page's values-table row headers (the °C section): short labels, the full name in the title
const OVERLAY_HEADERS = {
  "climate periods": { texts: ["’70–’00", "’91–’20"], title: "1970–2000" },
  "five weather years": { texts: ["2021", "1967", "1990", "2010", "2000"], title: "2021" },
  cities: { texts: ["PAR", "OSL"], title: "Paris" },
};

const walterLiethFigures = (page: Page) =>
  page.locator('figure[aria-label^="Walter-Lieth diagram,"]');
const chartTypeButton = (page: Page, name: string) =>
  page.getByRole("group", { name: "Chart type" }).getByRole("button", { name });
// * CSS colours ("var(--…)") as the page resolves them
const resolveColors = (page: Page, colors: readonly string[]) =>
  page.evaluate(
    (values) =>
      values.map((value) => {
        const probe = document.createElement("span");
        probe.style.color = value;
        document.body.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      }),
    colors,
  );
// * the bars' semantic fills (humid, arid), as the page resolves them
// * a bar style, saved before the app loads
const saveBarStyle = (page: Page, barStyle: TBarStyle) =>
  page.addInitScript(
    ({ key, value }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({ state: { chartBarStyle: value }, version: 1 }),
      );
    },
    { key: LOCAL_STORAGE_KEYS.SETTINGS, value: barStyle },
  );
// * the hatch style: these tests tell the bars apart by hatch
const saveHatchStyle = (page: Page) => saveBarStyle(page, "hatch");
const aridityFills = (page: Page) => resolveColors(page, [PRECIP_BAR.HUMID, PRECIP_BAR.ARID]);
// * each bar series' fills and its hatch (the pattern's suffix; solid: none drawn), by its first
// * bar's x; and whether anything is drawn above its bars
const barLayers = (page: Page) =>
  page.locator(".recharts-bar").evaluateAll((layers) =>
    layers
      .map((layer) => {
        const bars = [
          ...layer.querySelectorAll(".recharts-bar-rectangle rect:not([data-bar-hatch])"),
        ];
        const hatch = layer.querySelector("rect[data-bar-hatch]")?.getAttribute("fill") ?? "";
        return {
          x: bars[0]?.getBoundingClientRect().x ?? 0,
          fills: bars.map((bar) => getComputedStyle(bar).fill),
          hatch: /-([a-z]+)\)$/.exec(hatch)?.[1] ?? "solid",
          hasMarker: layer.querySelector(".recharts-bar-rectangle path") !== null,
        };
      })
      .sort((a, b) => a.x - b.x),
  );
const barHatches = async (page: Page) => (await barLayers(page)).map(({ hatch }) => hatch);
const hasBarMarkers = async (page: Page) =>
  (await barLayers(page)).some(({ hasMarker }) => hasMarker);
const barFills = async (page: Page) => [
  ...new Set((await barLayers(page)).flatMap(({ fills }) => fills)),
];
// * every fill is humid or arid: never an entity's colour
const expectAridityFills = async (page: Page) => {
  const allowed = await aridityFills(page);
  expect((await barFills(page)).every((fill) => allowed.includes(fill))).toBe(true);
};

test.describe("Walter-Lieth with Weather data (a single year)", () => {
  test("City Climate draws it, says it's one year, and names the year on Martonne", async ({
    page,
  }) => {
    await page.goto(`${CITY_URL}&dataset=weather`);
    const figure = walterLiethFigures(page);
    await expect(figure).toHaveCount(1, { timeout: 30_000 });
    await expect(figure).toHaveAttribute("aria-label", /Weather 2024 · single year/);
    await expect(chartTypeButton(page, "Walter-Lieth diagram")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(figure.getByText("Arid months")).toBeVisible();
    await expect(figure.getByText("Martonne (M) · 2024")).toBeVisible();
    // * drawn as Walter-Lieth, so variables and months follow its rule
    await expect(
      page.locator("aside").getByRole("button", { name: "Jan", exact: true }),
    ).toBeDisabled();
    await expect(
      page.locator("aside").getByText("Not available in Walter-Lieth view").first(),
    ).toBeVisible();
  });

  test("Climate keeps the Martonne class", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(walterLiethFigures(page)).toHaveCount(1, { timeout: 30_000 });
    await expect(walterLiethFigures(page).getByText("Martonne (M)")).toBeVisible();
  });

  test("Compare Cities draws a diagram per city", async ({ page }) => {
    await page.goto(`${CITIES_URL}&dataset=weather`);
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    // * the comparison table's Martonne row says which year it describes
    await expect(page.getByRole("rowheader", { name: "Martonne (M) · 2024" })).toBeVisible();
  });

  test("Compare Periods draws one diagram per weather year", async ({ page }) => {
    await page.goto(`${PERIODS_URL}&dataset=weather&periods=2021,1967`);
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    await expect(walterLiethFigures(page).nth(0)).toHaveAttribute("aria-label", /2021/);
    await expect(walterLiethFigures(page).nth(1)).toHaveAttribute("aria-label", /1967/);
    await expect(page.getByText("Weather · single year").first()).toBeVisible();
    await expect(page.getByText("Martonne index (M), per year")).toBeVisible();
  });

  test("the standard chart is one click away, with Weather too", async ({ page }) => {
    await page.goto(`${CITY_URL}&dataset=weather`);
    await expect(walterLiethFigures(page)).toHaveCount(1, { timeout: 30_000 });
    await chartTypeButton(page, "Standard chart").click();
    await expect(page).toHaveURL(/chart=standard/);
    await expect(walterLiethFigures(page)).toHaveCount(0);
    await expect(
      page.locator("aside").getByRole("button", { name: "Jan", exact: true }),
    ).toBeEnabled();
  });
});

test.describe("Compare Periods: which two weather years are drawn", () => {
  const WEATHER = `${PERIODS_URL}&dataset=weather`;
  const yearsShown = (page: Page) =>
    walterLiethFigures(page).evaluateAll((figures) =>
      figures.map((figure) => figure.getAttribute("aria-label")?.match(/diagram, (\d{4})/)?.[1]),
    );

  test("with two years: both drawn, no pickers", async ({ page }) => {
    await page.goto(`${WEATHER}&periods=2021,1967`);
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    await expect(page.getByTestId("year-a-select")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Swap periods" })).toHaveCount(0);
  });

  test("with four years: the first two by default, pick one side, swap — kept in the URL", async ({
    page,
  }) => {
    await page.goto(`${WEATHER}&periods=2021,1967,1990,2010`);
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    await expect.poll(() => yearsShown(page)).toEqual(["2021", "1967"]);

    await page.getByTestId("year-b-select").click();
    // * A's year can't be picked for B
    await expect(page.getByTestId("year-b-option-2021")).toBeDisabled();
    await page.getByTestId("year-b-option-1990").click();
    await expect(page).toHaveURL(/pair=2021%2C1990/);
    await expect.poll(() => yearsShown(page)).toEqual(["2021", "1990"]);

    // * on Weather the page shows the years editor, so this is the diagrams' swap
    await page.getByRole("button", { name: "Swap periods" }).click();
    await expect(page).toHaveURL(/pair=1990%2C2021/);
    await expect.poll(() => yearsShown(page)).toEqual(["1990", "2021"]);

    await page.reload();
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    await expect.poll(() => yearsShown(page)).toEqual(["1990", "2021"]);
  });

  test("an old wlYears link still opens its pair", async ({ page }) => {
    await page.goto(`${WEATHER}&periods=2021,1967,1990,2010&wlYears=2010,1990`);
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    await expect.poll(() => yearsShown(page)).toEqual(["2010", "1990"]);
  });

  test("the standard chart draws the same pair, with the same pickers", async ({ page }) => {
    await page.goto(`${WEATHER}&periods=2021,1967,1990,2010&pair=2010,1990&chart=standard`);
    await expect(page.getByTestId("year-a-select")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("year-a-select")).toContainText("2010");
    await expect(page.getByTestId("year-b-select")).toContainText("1990");
    await expect(walterLiethFigures(page)).toHaveCount(0);
  });

  test("removing a shown year falls back to the first one not on the other side", async ({
    page,
  }) => {
    await page.goto(`${WEATHER}&periods=2021,1967,1990,2010&wlYears=2021,1990`);
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    await expect.poll(() => yearsShown(page)).toEqual(["2021", "1990"]);

    await page.getByRole("button", { name: "Remove 1990" }).click();
    await expect(page).not.toHaveURL(/periods=[^&]*1990/);
    // * 2021 stays; B falls back to 1967 — the default pair now, so the param goes
    await expect.poll(() => yearsShown(page)).toEqual(["2021", "1967"]);
    await expect(page).not.toHaveURL(/wlYears=|pair=/);
  });
});

test.describe("Compare Periods: weather years overlaid", () => {
  const WEATHER = `${PERIODS_URL}&dataset=weather&periods=2021,1967,1990`;
  const yearChips = (page: Page) => page.getByRole("group", { name: "Years shown" });
  const chip = (page: Page, year: string) =>
    yearChips(page).getByRole("button", { name: year, exact: true });
  const expectShown = async (page: Page, shown: string[], hidden: string[]) => {
    for (const year of shown)
      await expect(chip(page, year)).toHaveAttribute("aria-pressed", "true");
    for (const year of hidden) {
      await expect(chip(page, year)).toHaveAttribute("aria-pressed", "false");
    }
  };

  test("the layout switch shows for weather years; Walter-Lieth starts with the pair", async ({
    page,
  }) => {
    await page.goto(WEATHER);
    await expect(walterLiethFigures(page)).toHaveCount(2, { timeout: 30_000 });
    await page
      .getByRole("group", { name: "Layout" })
      .getByRole("button", { name: "Overlay" })
      .click();
    await expect(page).toHaveURL(/layout=overlay/);
    // * one diagram: the side-by-side pair, not all five — the readable default
    await expect(walterLiethFigures(page)).toHaveCount(1);
    await expect(walterLiethFigures(page)).toHaveAttribute("aria-label", /2021.*1967/);
    await expect(walterLiethFigures(page)).not.toHaveAttribute("aria-label", /1990/);
    await expectShown(page, ["2021", "1967"], ["1990"]);
    await expect(page).not.toHaveURL(/shownYears=/);
  });

  test("chips toggle years; the last one stays on, without a hint", async ({ page }) => {
    await page.goto(`${WEATHER}&layout=overlay`);
    await expect(yearChips(page)).toBeVisible({ timeout: 30_000 });
    await chip(page, "1990").click();
    await expect(page).toHaveURL(/shownYears=2021%2C1967%2C1990/);
    await chip(page, "2021").click();
    await chip(page, "1967").click();
    await expect(chip(page, "1990")).toHaveAttribute("aria-disabled", "true");
    await expect(chip(page, "1990")).not.toHaveAttribute("aria-describedby", /.+/);
    await expect(page.getByText("At least one year")).toHaveCount(0);
    // * aria-disabled, so Playwright won't click it without force — a tap does nothing
    await chip(page, "1990").click({ force: true });
    await expect(chip(page, "1990")).toHaveAttribute("aria-pressed", "true");
    // * back to the default (the pair): the param goes
    for (const year of ["2021", "1967", "1990"]) await chip(page, year).click();
    await expectShown(page, ["2021", "1967"], ["1990"]);
    await expect(page).not.toHaveURL(/shownYears=/);
  });

  test("removing the only shown year falls back to the default", async ({ page }) => {
    await page.goto(`${WEATHER}&layout=overlay&shownYears=1990`);
    await expect(yearChips(page)).toBeVisible({ timeout: 30_000 });
    await expectShown(page, ["1990"], ["2021", "1967"]);
    await page.getByRole("button", { name: "Remove 1990" }).click();
    await expectShown(page, ["2021", "1967"], []);
    await expect(page).not.toHaveURL(/shownYears=/);
  });

  test("the standard chart overlays every year by default, under the same chips", async ({
    page,
  }) => {
    await page.goto(`${WEATHER}&layout=overlay&chart=standard`);
    await expect(yearChips(page)).toBeVisible({ timeout: 30_000 });
    await expect(walterLiethFigures(page)).toHaveCount(0);
    await expectShown(page, ["2021", "1967", "1990"], []);
    await chip(page, "2021").click();
    await expect(page).toHaveURL(/shownYears=1967%2C1990/);
  });

  test("bars sit in the year list's order, also after chips hide and show a year", async ({
    page,
  }) => {
    await saveHatchStyle(page);
    await page.goto(`${WEATHER}&layout=overlay&chart=standard`);
    await expect(page.locator(".recharts-bar")).toHaveCount(3, { timeout: 30_000 });
    // * each year's hatch, by its place in the list (2021, 1967, 1990); fills by aridity; nothing
    // * drawn above the bars
    const listOrder = SERIES_HATCHES.slice(0, 3);
    await expect.poll(() => barHatches(page)).toEqual(listOrder);
    await expectAridityFills(page);
    expect(await hasBarMarkers(page)).toBe(false);

    // * the pointer leaves the chips after each click: a hovered chip focuses its year
    await chip(page, "2021").click();
    await page.mouse.move(0, 0);
    await expect.poll(() => barHatches(page)).toEqual(listOrder.slice(1));
    await chip(page, "2021").click();
    await page.mouse.move(0, 0);
    await expect.poll(() => barHatches(page)).toEqual(listOrder);
  });

  test("from sm the year chips and the variable chips share one row", async ({ page }) => {
    await page.goto(`${WEATHER}&layout=overlay&chart=standard`);
    await expect(yearChips(page)).toBeVisible({ timeout: 30_000 });
    const years = await chip(page, "2021").boundingBox();
    const variable = await page
      .locator("main")
      .getByRole("button", { name: "Max temp", exact: true })
      .boundingBox();
    expect(years && variable).toBeTruthy();
    if (!years || !variable) return;
    // * same row (centred), years on the left, the chart's chips on the right
    expect(Math.abs(years.y + years.height / 2 - (variable.y + variable.height / 2))).toBeLessThan(
      4,
    );
    expect(years.x).toBeLessThan(variable.x);
  });

  test("each chart type keeps its default until a chip is picked; a pick sticks in both", async ({
    page,
  }) => {
    await page.goto(`${WEATHER}&layout=overlay`);
    await expect(yearChips(page)).toBeVisible({ timeout: 30_000 });
    await expectShown(page, ["2021", "1967"], ["1990"]);
    await chartTypeButton(page, "Standard chart").click();
    await expectShown(page, ["2021", "1967", "1990"], []);
    await chip(page, "2021").click();
    await expect(page).toHaveURL(/shownYears=1967%2C1990/);
    await chartTypeButton(page, "Walter-Lieth diagram").click();
    await expectShown(page, ["1967", "1990"], ["2021"]);
    await expect(page).toHaveURL(/shownYears=1967%2C1990/);
  });
});

test("the last selected variable stays on, without a hint", async ({ page }) => {
  await page.goto(`${CITY_URL}&chart=standard&var=tmax`);
  const lastVariable = page.locator("aside").getByRole("button", { name: "Max temp", exact: true });
  await expect(lastVariable).toHaveAttribute("aria-disabled", "true", { timeout: 30_000 });
  await expect(lastVariable).toHaveAttribute("aria-pressed", "true");
  await expect(lastVariable).toHaveClass(/cursor-not-allowed/);
  await expect(page.getByText("At least one variable")).toHaveCount(0);
});

test("a middle year loading last never shifts the other years' colours", async ({ page }) => {
  await saveHatchStyle(page);
  let release = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(/\/api\/worldclim\/.*[?&]year=1990(&|$)/, async (route) => {
    await held;
    await route.continue();
  });
  // * the stats table's header marks each year with its colour
  // * the stats table's header marks each year with its shape
  const headerShape = (year: string) =>
    page
      .getByRole("columnheader", { name: year })
      .locator("[data-series-shape]")
      .first()
      .getAttribute("data-series-shape");

  await page.goto(
    `${PERIODS_URL}&dataset=weather&periods=2021,1990,2010&layout=overlay&chart=standard&grid=10m`,
  );
  // * by place in the list: 2021 first, 1990 second (held back), 2010 third — the bars' hatches
  // * and the table's header shapes alike
  const [first, second, third] = SERIES_HATCHES;
  // * 1990 still loading: 2021 and 2010 keep the first and third places — chart and table
  await expect.poll(() => barHatches(page), { timeout: 30_000 }).toEqual([first, third]);
  expect(await headerShape("2010")).toBe(SERIES_SHAPES[2]);

  release();
  // * the set remounts, its bars growing from 0: the hatches show once they have height
  await expect.poll(() => barHatches(page), { timeout: 30_000 }).toEqual([first, second, third]);
});

test.describe("precipitation bars on the comparison charts", () => {
  for (const { page: name, url } of [
    { page: "Compare Cities", url: `${CITIES_URL}&chart=standard` },
    { page: "Compare Periods", url: `${PERIODS_URL}&chart=standard` },
  ]) {
    test(`${name}: bars by aridity side by side; overlaid with hatches, A solid and B hatched`, async ({
      page,
    }) => {
      await saveHatchStyle(page);
      await page.goto(url);
      await expect(page.locator(".recharts-bar")).toHaveCount(2, { timeout: 30_000 });
      await expectAridityFills(page);
      // * side by side: no hatch at all
      await expect(page.locator("rect[data-bar-hatch]")).toHaveCount(0);

      await page
        .getByRole("group", { name: "Layout" })
        .getByRole("button", { name: "Overlay" })
        .click();
      await expect.poll(() => barHatches(page)).toEqual(SERIES_HATCHES.slice(0, 2));
      await expectAridityFills(page);
      expect(await hasBarMarkers(page)).toBe(false);
    });
  }
});

test.describe("overlay: hover and sideways scroll", () => {
  test("hovering a curve names its variable and entity", async ({ page }) => {
    await page.goto(`${CITIES_URL}&chart=standard&layout=overlay`);
    const dots = page.locator('path[data-series-dot="circle"]');
    await expect(dots.first()).toBeVisible({ timeout: 30_000 });
    // * Paris (circle), July's point of its first curve — max temperature
    await page.waitForLoadState("networkidle");
    // * the chart remounts once both cities' data are in, its curves drawing in: let them settle
    await page.waitForTimeout(1500);
    await dots.nth(6).scrollIntoViewIfNeeded();
    const box = await dots.nth(6).boundingBox();
    if (!box) throw new Error("no July point");
    await page.mouse.move(box.x + box.width / 2 + 2, box.y + box.height / 2);
    const tooltip = page.locator("[data-tooltip-focus]");
    await expect(tooltip).toContainText("Max Temperature · Paris");
    await expect(tooltip).toContainText("Jul");
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
  });

  test("five years on a phone: the plot scrolls under fixed axes, the table's months stay under the plot's", async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto(FIVE_YEARS_URL);
    const scroller = page.locator("[data-overlay-scroller]");
    await expect(scroller).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Swipe to see every month")).toBeVisible();
    await expect(page.locator("[data-fixed-axis]")).toHaveCount(2);
    await scroller.evaluate((element) => {
      element.scrollLeft = 200;
      element.dispatchEvent(new Event("scroll"));
    });
    // * the table follows the plot
    const table = page.locator("[data-values-scroller]");
    await expect.poll(() => table.evaluate((element) => element.scrollLeft)).toBe(200);
    // * July's column sits under July's label on the plot (a phone: initials, July the 7th;
    // * the entities' own hidden x axes have no labels)
    const label = await scroller.evaluate((element) => {
      const labels = [...element.querySelectorAll(".recharts-xAxis-tick-labels text")].filter(
        (text) => text.textContent !== "",
      );
      const box = labels[6]?.getBoundingClientRect();
      return box ? { x: box.x, width: box.width } : null;
    });
    const cell = await table.locator("tbody tr").nth(1).locator("td").nth(6).boundingBox();
    if (!label || !cell) throw new Error("no July");
    expect(Math.abs(label.x + label.width / 2 - (cell.x + cell.width / 2))).toBeLessThan(3);
    // * the header column is the fixed left axis' width
    const header = await table.locator("tbody th").first().boundingBox();
    const axis = await page.locator('[data-fixed-axis="left"] > div').first().boundingBox();
    if (!header || !axis) throw new Error("no header");
    expect(Math.abs(header.width + 1 - axis.width)).toBeLessThan(1.5);
    await expect(table.locator("tbody th [title]").first()).toHaveAttribute("title", "2021");
    // * only the fixed axes draw °C: the plot's own would slide out under them
    await expect(page.locator("svg text").getByText("°C", { exact: true })).toHaveCount(1);
  });

  for (const { viewport, barStyle } of DESKTOPS) {
    test(`five years at ${viewport.width} px, ${barStyle}: the whole year fits, no scroll`, async ({
      page,
    }) => {
      await saveBarStyle(page, barStyle);
      await page.setViewportSize(viewport);
      await page.goto(FIVE_YEARS_URL);
      await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
      await expect(page.locator("[data-overlay-scroller]")).toHaveCount(0);
      await expect(page.locator("[data-fixed-axis]")).toHaveCount(0);
      await expect(page.getByText("Swipe to see every month")).toHaveCount(0);
      await expect(
        page.locator("svg.recharts-surface").getByText("Dec", { exact: true }),
      ).toBeVisible();
      // * the values table in the stats table's type, every value inside its month's column
      const type = await page.evaluate(() => {
        const font = (element: Element | null) =>
          element ? getComputedStyle(element).fontSize : "";
        const table = document.querySelector('[data-chart-block="valuesTable"] table');
        const cells = [...(table?.querySelectorAll("td[tabindex]") ?? [])];
        return {
          value: font(cells[0] ?? null),
          name: font(table?.querySelector("tbody th > span") ?? null),
          stats: font(document.querySelector("[data-chart-block='statsTable'] table")),
          overflowing: cells.filter((cell) => cell.scrollWidth > cell.clientWidth).length,
        };
      });
      expect(type.value).toBe(type.stats);
      expect(type.name).toBe(type.stats);
      expect(type.overflowing).toBe(0);
    });
  }

  for (const [name, url] of Object.entries(OVERLAY_URLS)) {
    test(`${name}: the plot starts at its left axis, the table's months under the plot's`, async ({
      page,
    }) => {
      await page.goto(url);
      await expect(page.locator(".recharts-bar").first()).toBeVisible({ timeout: 30_000 });
      // * text headers, no markings; hovering one focuses its entity
      const { texts, title } = OVERLAY_HEADERS[name as keyof typeof OVERLAY_HEADERS];
      const headers = page
        .locator('[data-chart-block="valuesTable"] tbody tr')
        .nth(1)
        .locator("th [title]");
      await expect(headers).toHaveText(texts);
      await expect(headers.first()).toHaveAttribute("title", title);
      await expect(page.locator('[data-chart-block="valuesTable"] tbody th svg')).toHaveCount(0);
      await headers.first().hover();
      await expect
        .poll(() =>
          page
            .locator(".recharts-bar-rectangle rect[fill='var(--color-chart-context-bar)']")
            .count(),
        )
        .toBeGreaterThan(0);
      await page.mouse.move(0, 0);
      const geometry = await page.evaluate(() => {
        const surface = document.querySelector(".recharts-surface")?.getBoundingClientRect();
        const axis = document
          .querySelector(".recharts-yAxis .recharts-cartesian-axis-line")
          ?.getBoundingClientRect();
        const table = document.querySelector('[data-chart-block="valuesTable"] table');
        const header = table?.querySelector("tbody th")?.getBoundingClientRect();
        const centre = (box: DOMRect | undefined) => (box ? box.x + box.width / 2 : NaN);
        const labels = [
          ...document.querySelectorAll(
            ".recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value",
          ),
        ];
        const cells = [...(table?.querySelectorAll("tbody tr:nth-child(2) td[tabindex]") ?? [])];
        return {
          axisArea: (axis?.x ?? NaN) - (surface?.x ?? NaN),
          header: header?.width ?? NaN,
          offsets: cells.map((cell, i) =>
            Math.abs(
              centre(cell.getBoundingClientRect()) - centre(labels[i]?.getBoundingClientRect()),
            ),
          ),
        };
      });
      // * the left margin is the °C axis' own width — and the table's header column (its frame's
      // * border given back)
      expect(geometry.axisArea).toBeCloseTo(AXIS_WIDTH, 0);
      expect(Math.abs(geometry.header + 1 - AXIS_WIDTH)).toBeLessThan(1.5);
      expect(geometry.offsets).toHaveLength(12);
      geometry.offsets.forEach((offset) => expect(offset).toBeLessThan(3));
    });
  }

  test("a value cell highlights its month; a header marker focuses its entity, no month", async ({
    page,
  }) => {
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    const table = page.locator('[data-chart-block="valuesTable"] table').first();
    const band = page.locator(".recharts-reference-area");
    const hoveredCells = table.locator('td[style*="background-color"]');
    await table.locator("tbody tr").nth(1).locator("td").nth(HOVERED_MONTH).hover();
    await expect(band).toHaveCount(1);
    await expect(hoveredCells).toHaveCount(4);
    await expect(
      page.locator(".recharts-bar-rectangle rect[fill='var(--color-chart-context-bar)']"),
    ).toHaveCount(0);
    // * 1967's marker in the °C row: the others turn gray, no month is highlighted
    await table.locator("tbody th [title='1967']").first().hover();
    await expect(band).toHaveCount(0);
    await expect(hoveredCells).toHaveCount(0);
    await expect
      .poll(() =>
        page.locator(".recharts-bar-rectangle rect[fill='var(--color-chart-context-bar)']").count(),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        page
          .locator("path[data-series-dot]")
          .evaluateAll((dots) => [
            ...new Set(dots.map((dot) => dot.getAttribute("data-series-dot"))),
          ]),
      )
      .toEqual([SERIES_SHAPES[1]]);
  });

  test("five years: the chips hold their row across views, the guide beside them", async ({
    page,
  }) => {
    const chipsBox = async (url: string) => {
      await page.goto(url);
      const chips = page.locator("[data-toolbar-chips]");
      await expect(chips).toBeVisible({ timeout: 30_000 });
      const box = await chips.boundingBox();
      if (!box) throw new Error("no chips");
      return box;
    };
    const standard = await chipsBox(FIVE_YEARS_URL);
    const walterLieth = await chipsBox(FIVE_YEARS_URL.replace("&chart=standard", ""));
    expect(Math.abs(walterLieth.y - standard.y)).toBeLessThan(1);
    // * the guide on the chips' row, on the right
    const guide = await page
      .getByRole("button", { name: "How to read this diagram" })
      .boundingBox();
    if (!guide) throw new Error("no guide");
    const centre = (box: { y: number; height: number }) => box.y + box.height / 2;
    expect(Math.abs(centre(guide) - centre(walterLieth))).toBeLessThan(4);
    expect(guide.x).toBeGreaterThan(walterLieth.x + walterLieth.width);
  });

  test("a hovered month: one continuous band down the values table", async ({ page }) => {
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    const table = page.locator('[data-chart-block="valuesTable"] table').first();
    await table.locator("tbody tr").nth(1).locator("td").nth(HOVERED_MONTH).hover();
    const [hover] = await resolveColors(page, ["var(--color-state-hover)"]);
    // * once the cells' fade has settled: every row's cell of the month in the band's colour
    await expect
      .poll(() =>
        table.evaluate(
          (element, month) =>
            [...element.querySelectorAll("tbody tr")].map((row) => {
              const cell = row.children[month + 1];
              return cell ? getComputedStyle(cell).backgroundColor : "";
            }),
          HOVERED_MONTH,
        ),
      )
      .toEqual(Array.from({ length: 4 }, () => hover));
    const band = await table.evaluate((element, month) => {
      const cells = [...element.querySelectorAll("tbody tr")].map((row) => row.children[month + 1]);
      const boxes = cells.map((cell) => cell?.getBoundingClientRect());
      const tableBox = element.getBoundingClientRect();
      return {
        // * each cell starts where the one above ends: no gap in the band
        gaps: boxes.slice(1).map((box, i) => Math.abs((box?.top ?? 0) - (boxes[i]?.bottom ?? 0))),
        top: Math.abs((boxes[0]?.top ?? 0) - tableBox.top),
        bottom: Math.abs((boxes.at(-1)?.bottom ?? 0) - tableBox.bottom),
      };
    }, HOVERED_MONTH);
    band.gaps.forEach((gap) => expect(gap).toBeLessThan(1.5));
    expect(band.top).toBeLessThan(1.5);
    expect(band.bottom).toBeLessThan(1.5);
  });

  test("five years: hovering a year chip turns the other years gray", async ({ page }) => {
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await page
      .getByRole("group", { name: "Years shown" })
      .getByRole("button", { name: "1990", exact: true })
      .hover();
    // * the four other years' bars plain gray; only 1990 keeps its points (its shape)
    await expect
      .poll(() =>
        page
          .locator(".recharts-bar-rectangle rect")
          .evaluateAll(
            (rects) =>
              rects.filter((r) => r.getAttribute("fill") === "var(--color-chart-context-bar)")
                .length,
          ),
      )
      .toBeGreaterThan(0);
    await expect
      .poll(() =>
        page
          .locator("path[data-series-dot]")
          .evaluateAll((dots) => [
            ...new Set(dots.map((dot) => dot.getAttribute("data-series-dot"))),
          ]),
      )
      .toEqual([SERIES_SHAPES[2]]);
    const contextLines = await page
      .locator(".recharts-line path.recharts-curve")
      .evaluateAll(
        (paths) =>
          paths.filter((p) => p.getAttribute("stroke") === "var(--color-chart-context-line)")
            .length,
      );
    expect(contextLines).toBeGreaterThan(0);
  });

  test("five years, three hidden: the two left get wider bars, their points over them", async ({
    page,
  }) => {
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await page.waitForLoadState("networkidle");
    const barWidth = () =>
      page
        .locator(".recharts-bar-rectangle rect:not([data-bar-hatch])")
        .first()
        .evaluate((rect) => rect.getBoundingClientRect().width);
    const fiveWide = await barWidth();
    const chips = page.getByRole("group", { name: "Years shown" });
    for (const year of ["1990", "2010", "2000"]) {
      await chips.getByRole("button", { name: year, exact: true }).click();
      await page.mouse.move(0, 0);
    }
    await expect.poll(barWidth).toBeGreaterThan(fiveWide * 2);
    await page.waitForTimeout(1500);
    // * 1967 (the squares): July's point over July's 1967 bar
    const centres = await page.evaluate(() => {
      const centreOf = (element: Element | undefined) => {
        const box = element?.getBoundingClientRect();
        return box ? box.x + box.width / 2 : NaN;
      };
      const layers = [...document.querySelectorAll(".recharts-bar")]
        .map((layer) => [
          ...layer.querySelectorAll(".recharts-bar-rectangle rect:not([data-bar-hatch])"),
        ])
        .filter((rects) => rects.length > 0)
        .sort((a, b) => centreOf(a[0]) - centreOf(b[0]));
      return {
        layers: layers.length,
        bar: centreOf(layers[1]?.[6]),
        point: centreOf(document.querySelectorAll('path[data-series-dot="square"]')[6]),
      };
    });
    expect(centres.layers).toBe(2);
    expect(Math.abs(centres.bar - centres.point)).toBeLessThan(1.5);
  });

  test("a curve's points sit at the centre of their own bars", async ({ page }) => {
    await page.goto(`${CITIES_URL}&chart=standard&layout=overlay`);
    await expect(page.locator(".recharts-bar")).toHaveCount(2, { timeout: 30_000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    // * B (Oslo, the squares): July's point over July's B bar
    const centres = await page.evaluate(() => {
      const centreOf = (element: Element | undefined) => {
        const box = element?.getBoundingClientRect();
        return box ? box.x + box.width / 2 : NaN;
      };
      const layers = [...document.querySelectorAll(".recharts-bar")]
        .map((layer) => [
          ...layer.querySelectorAll(".recharts-bar-rectangle rect:not([data-bar-hatch])"),
        ])
        .sort((a, b) => centreOf(a[0]) - centreOf(b[0]));
      return {
        bar: centreOf(layers[1]?.[6]),
        point: centreOf(document.querySelectorAll('path[data-series-dot="square"]')[6]),
      };
    });
    expect(Math.abs(centres.bar - centres.point)).toBeLessThan(1.5);
  });
});
