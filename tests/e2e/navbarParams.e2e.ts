import { expect, test, type Page } from "@playwright/test";

const FIVE_YEARS = "2021,1967,1990,2010,2000";
const COMPARE_PERIODS = `/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038&dataset=weather&periods=${FIVE_YEARS}&layout=overlay`;

const navLink = (page: Page, name: string) =>
  page.locator("header nav").getByRole("link", { name, exact: true });
const removeYear = (page: Page, year: string) =>
  page.getByRole("button", { name: `Remove ${year}` });

async function expectFiveYears(page: Page) {
  await expect(page).toHaveURL(new RegExp(`periods=${FIVE_YEARS.replaceAll(",", "(?:,|%2C)")}`));
  await expect(removeYear(page, "2000")).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveURL(/layout=overlay/);
}

test.describe("navbar links remember each page's own params", () => {
  test("weather years and layout come back via the navbar, after a reload too", async ({
    page,
  }) => {
    await page.goto(COMPARE_PERIODS);
    await expectFiveYears(page);

    await navLink(page, "City Climate").click();
    await expect(page).toHaveURL(/\/climate-statistics/);
    // * the years are Compare Periods' own — City Climate's URL doesn't carry them
    await expect(page).not.toHaveURL(/periods=/);
    await expect(page).toHaveURL(/dataset=weather/);

    await navLink(page, "Compare Periods").click();
    await expect(page).toHaveURL(/\/compare-periods/);
    await expectFiveYears(page);

    // * remembered across a reload (persisted), then the same trip again
    await page.reload();
    await navLink(page, "City Climate").click();
    await expect(page).toHaveURL(/\/climate-statistics/);
    await page.reload();
    await navLink(page, "Compare Periods").click();
    await expectFiveYears(page);
  });

  test("the logo goes the navbar's way: City Climate keeps its params, and back", async ({
    page,
  }) => {
    await page.goto("/climate-statistics?city=Madrid&lat=40.4168&lng=-3.7038&chart=standard");
    await expect(page).toHaveURL(/chart=standard/);
    await page.goto(COMPARE_PERIODS);
    await expectFiveYears(page);

    // * "/" would redirect to City Climate dropping every param — the logo links there itself
    await page.getByRole("banner").getByRole("link", { name: "Climatica" }).click();
    await expect(page).toHaveURL(/\/climate-statistics\?/);
    await expect(page).toHaveURL(/chart=standard/);
    await expect(page).toHaveURL(/dataset=weather/);

    await navLink(page, "Compare Periods").click();
    await expectFiveYears(page);
  });

  test("a clean URL opened directly shows the defaults", async ({ page }) => {
    await page.goto(COMPARE_PERIODS);
    await expectFiveYears(page);

    await page.goto("/compare-periods?dataset=weather");
    // * the two default years, side by side (the default layout)
    const diagrams = page.locator('figure[aria-label^="Walter-Lieth diagram,"]');
    await expect(diagrams).toHaveCount(2, { timeout: 30_000 });
    await expect(diagrams.nth(0)).toHaveAttribute("aria-label", /2021/);
    await expect(diagrams.nth(1)).toHaveAttribute("aria-label", /1967/);
    await expect(removeYear(page, "2000")).toHaveCount(0);
    await expect(page).not.toHaveURL(/periods=|layout=/);
  });

  test("a link opened in a new tab is the plain, shareable one", async ({ page }) => {
    await page.goto(COMPARE_PERIODS);
    await expectFiveYears(page);
    await navLink(page, "City Climate").click();
    await expect(page).toHaveURL(/\/climate-statistics/);
    await expect(navLink(page, "Compare Periods")).toHaveAttribute(
      "href",
      /\/compare-periods\?dataset=weather$/,
    );
  });
});
