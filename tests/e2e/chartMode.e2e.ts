import { expect, test, type Page } from "@playwright/test";

const PARIS = "city=Paris&lat=48.8566&lng=2.3522";
const CITY_URL = `/climate-statistics?${PARIS}`;
const CITIES_URL =
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522";
const PERIODS_URL = "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038";

const walterLiethFigures = (page: Page) =>
  page.locator('figure[aria-label^="Walter-Lieth diagram,"]');
const chartTypeButton = (page: Page, name: string) =>
  page.getByRole("group", { name: "Chart type" }).getByRole("button", { name });

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
    // * the year chips' dot colours, left to right, are the list's
    const chipColors = () =>
      yearChips(page)
        .locator("button span[style]")
        .evaluateAll((dots) => dots.map((dot) => getComputedStyle(dot).backgroundColor));
    // * each bar series' colour, by its first bar's x — the order within a month
    const barColors = () =>
      page.locator(".recharts-bar").evaluateAll((layers) =>
        layers
          .map((layer) => {
            const bar = layer.querySelector(".recharts-bar-rectangle");
            const fill = bar?.querySelector("[fill]");
            return {
              x: bar?.getBoundingClientRect().x ?? 0,
              color: fill ? getComputedStyle(fill).fill : "",
            };
          })
          .sort((a, b) => a.x - b.x)
          .map(({ color }) => color),
      );

    await page.goto(`${WEATHER}&layout=overlay&chart=standard`);
    await expect(page.locator(".recharts-bar")).toHaveCount(3, { timeout: 30_000 });
    const listOrder = await chipColors();
    await expect.poll(barColors).toEqual(listOrder);

    await chip(page, "2021").click();
    await expect.poll(barColors).toEqual(listOrder.slice(1));
    await chip(page, "2021").click();
    await expect.poll(barColors).toEqual(listOrder);
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
  // * PERIOD_COLORS by place in the list: 2021 first, 1990 second (held back), 2010 third
  const [first, , third] = ["rgb(29, 158, 117)", "rgb(245, 158, 11)", "rgb(59, 130, 246)"];
  let release = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(/\/api\/worldclim\/.*[?&]year=1990(&|$)/, async (route) => {
    await held;
    await route.continue();
  });
  const barColors = () =>
    page.locator(".recharts-bar").evaluateAll((layers) =>
      layers
        .map((layer) => {
          const bar = layer.querySelector(".recharts-bar-rectangle");
          const fill = bar?.querySelector("[fill]");
          return {
            x: bar?.getBoundingClientRect().x ?? 0,
            color: fill ? getComputedStyle(fill).fill : "",
          };
        })
        .sort((a, b) => a.x - b.x)
        .map(({ color }) => color),
    );
  const headerColor = (year: string) =>
    page.getByRole("columnheader", { name: year }).evaluate((cell) => getComputedStyle(cell).color);

  await page.goto(
    `${PERIODS_URL}&dataset=weather&periods=2021,1990,2010&layout=overlay&chart=standard&grid=10m`,
  );
  // * 1990 still loading: 2021 and 2010 keep the first and third colours — chart and table
  await expect.poll(barColors, { timeout: 30_000 }).toEqual([first, third]);
  expect(await headerColor("2010")).toBe(third);

  release();
  await expect.poll(barColors, { timeout: 30_000 }).toHaveLength(3);
  expect((await barColors())[0]).toBe(first);
  expect((await barColors())[2]).toBe(third);
});
