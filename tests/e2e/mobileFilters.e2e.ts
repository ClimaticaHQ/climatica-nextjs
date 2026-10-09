import { devices, expect, test, type Page, type Request } from "@playwright/test";

test.use({ ...devices["Pixel 7"] });

const PARIS = "city=Paris&lat=48.8566&lng=2.3522";
const MADRID = "city=Madrid&lat=40.4168&lng=-3.7038";
const CITY_URL = `/climate-statistics?${PARIS}`;
const PERIODS_URL = `/compare-periods?${MADRID}`;
const DATA_REQUEST = /\/api\/worldclim\/pixelvaluesofapoint\?lat=48\.8566/;

const param = (page: Page, name: string) => new URL(page.url()).searchParams.get(name);
const historyLength = (page: Page) => page.evaluate(() => window.history.length);
const standardChartButton = (page: Page) =>
  page.getByRole("group", { name: "Chart type" }).getByRole("button", { name: "Standard chart" });
const chipLabels = (page: Page) =>
  page
    .locator("main [aria-haspopup=dialog]")
    .evaluateAll((chips) => chips.map((chip) => chip.getAttribute("aria-label")));

/** Opens the n-th dropdown inside the open sheet and picks an option by its value. */
async function pickInSheet(page: Page, dropdownIndex: number, value: string) {
  const sheet = page.getByRole("dialog");
  await sheet.locator("button[aria-expanded]").nth(dropdownIndex).click();
  await sheet.locator(`button[data-value="${value}"]`).click();
}

async function openFullSheet(page: Page) {
  await page.getByRole("button", { name: /^Filters/ }).click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
}

test.describe("Mobile filters", () => {
  test("a single-choice chip applies with replace and survives a reload", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(page.getByRole("button", { name: "Resolution: 2.5 min" })).toBeVisible();
    const lengthBefore = await historyLength(page);

    await page.getByRole("button", { name: "Resolution: 2.5 min" }).click();
    await pickInSheet(page, 0, "10m");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/grid=10m/);
    // * replace: the sheet's own entry was popped, and the filter change added none
    expect(await historyLength(page)).toBe(lengthBefore + 1);
    await expect(page.evaluate(() => window.history.state?.__climaticaSheet)).resolves.toBeFalsy();

    const dataRequest = page.waitForRequest(DATA_REQUEST);
    await page.reload();
    await expect(page.getByRole("button", { name: "Resolution: 10 min" })).toBeVisible();
    expect((await dataRequest).url()).toContain("Grid_10m");
  });

  test("the full sheet applies several filters with push; Back restores the previous set", async ({
    page,
  }) => {
    await page.goto(CITY_URL);
    await expect(page.getByRole("button", { name: "Filters, none changed" })).toBeVisible();

    await openFullSheet(page);
    await pickInSheet(page, 0, "c1991-2020");
    await pickInSheet(page, 1, "10m");
    await page.getByRole("dialog").getByRole("button", { name: "Apply" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/period=c1991-2020/);
    expect(param(page, "grid")).toBe("10m");
    await expect(page.getByRole("button", { name: "Filters, 2 changed" })).toBeVisible();

    await page.goBack();
    await expect(page.getByRole("button", { name: "Filters, none changed" })).toBeVisible();
    expect(param(page, "period")).toBeNull();
    expect(param(page, "grid")).toBeNull();
    await expect(page.getByRole("button", { name: "Climate period: 1970–2000" })).toBeVisible();
  });

  for (const closeBy of ["Escape", "backdrop"] as const) {
    test(`closing the full sheet by ${closeBy} applies nothing`, async ({ page }) => {
      await page.goto(CITY_URL);
      await expect(page.getByRole("button", { name: "Filters, none changed" })).toBeVisible();
      const urlBefore = page.url();

      await openFullSheet(page);
      await pickInSheet(page, 0, "c1991-2020");
      if (closeBy === "Escape") await page.keyboard.press("Escape");
      else await page.getByTestId("bottom-sheet-backdrop").click({ position: { x: 10, y: 10 } });

      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(page.url()).toBe(urlBefore);
      await expect(page.getByRole("button", { name: "Filters, none changed" })).toBeVisible();

      // * reopened, the sheet starts from the applied filters again
      await openFullSheet(page);
      await expect(page.getByRole("dialog").locator("button[aria-expanded]").first()).toContainText(
        "1970–2000",
      );
    });
  }

  test("a shared link opens with the same chips, chart mode and data request", async ({
    page,
    browser,
  }) => {
    const requests: string[] = [];
    page.on("request", (request: Request) => {
      if (DATA_REQUEST.test(request.url())) requests.push(request.url());
    });
    await page.goto(CITY_URL);
    await page.getByRole("button", { name: "Resolution: 2.5 min" }).click();
    await pickInSheet(page, 0, "10m");
    await expect(page).toHaveURL(/grid=10m/);
    await openFullSheet(page);
    await pickInSheet(page, 0, "c1961-1990");
    await page.getByRole("dialog").getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/period=c1961-1990/);
    await standardChartButton(page).click();
    await expect(page).toHaveURL(/chart=standard/);
    await expect.poll(() => requests.some((url) => url.includes("Grid_10m"))).toBe(true);

    const sharedUrl = page.url();
    const chips = await chipLabels(page);
    const lastRequest = new URL(requests.filter((url) => url.includes("Grid_10m")).at(-1) ?? "");

    const fresh = await browser.newContext({ ...devices["Pixel 7"] });
    const other = await fresh.newPage();
    const otherRequest = other.waitForRequest(DATA_REQUEST);
    await other.goto(sharedUrl);

    await expect(other.getByRole("button", { name: "Resolution: 10 min" })).toBeVisible();
    expect(await chipLabels(other)).toEqual(chips);
    await expect(standardChartButton(other)).toHaveAttribute("aria-pressed", "true");
    expect(new URL((await otherRequest).url()).search).toBe(lastRequest.search);
    await fresh.close();
  });

  test("Walter-Lieth: a disabled chip explains, and switches to the standard chart", async ({
    page,
  }) => {
    await page.goto(CITY_URL);
    const disabledVariables = page.getByRole("button", {
      name: "Variables: Not available in Walter-Lieth view",
    });
    await expect(disabledVariables).toBeVisible();

    await disabledVariables.click();
    const sheet = page.getByRole("dialog", { name: "Walter-Lieth diagram" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Switch to standard chart" }).click();

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/chart=standard/);
    await expect(page.getByRole("button", { name: "Variables: Max temp +2" })).toBeVisible();
    await expect(disabledVariables).toHaveCount(0);
  });

  test("Compare Periods: change Period B, swap; Weather shows the years editor", async ({
    page,
  }) => {
    await page.goto(PERIODS_URL);
    // * below lg the selectors are on the page, applying at once — not in the (hidden) sidebar
    await expect(page.locator("main").getByTestId("period-b-select")).toBeVisible();
    await expect(page.locator("aside").getByTestId("period-b-select")).toHaveCount(0);
    await page.getByTestId("period-b-select").click();
    await page.getByTestId("period-b-option-c1981-2010").click();
    await expect(page).toHaveURL(/period2=c1981-2010/);
    // * Period A is the default, so it isn't written
    expect(param(page, "period1")).toBeNull();

    await page.getByRole("button", { name: "Swap periods" }).click();
    await expect(page).toHaveURL(/period1=c1981-2010/);
    expect(param(page, "period2")).toBe("c1970-2000");

    await page.goto(`${PERIODS_URL}&dataset=weather`);
    await expect(page.locator("main").getByRole("button", { name: "Add period" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Swap periods" })).toHaveCount(0);
  });

  test("the resolution sheet says why 30 s is unavailable", async ({ page }) => {
    await page.goto(`${CITY_URL}&period=c1991-2020`);
    await page.getByRole("button", { name: "Resolution: 2.5 min" }).click();
    const sheet = page.getByRole("dialog");
    await sheet.locator("button[aria-expanded]").first().click();
    const option = sheet.locator('button[data-value="30s"]');
    await expect(option).toBeDisabled();
    await expect(option).toHaveAccessibleDescription("Only for Climate 1970–2000");
  });

  test("Back with a sheet open closes it without changing the URL", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(page.getByRole("button", { name: "Resolution: 2.5 min" })).toBeVisible();
    const urlBefore = page.url();

    for (const open of [
      () => page.getByRole("button", { name: "Resolution: 2.5 min" }).click(),
      () => openFullSheet(page),
    ]) {
      await open();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.goBack();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(page.url()).toBe(urlBefore);
    }
    // * still on the page: Back left only the sheets' own entries
    await expect(page.getByRole("button", { name: /^Filters/ })).toBeVisible();
  });
});
