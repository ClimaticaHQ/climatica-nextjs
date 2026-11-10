import { LG_MEDIA_QUERY } from "@/constants/breakpoint.constant";
import { expect, test, type Page } from "@playwright/test";

// * WCAG 1.4.4: text follows the browser's default font size (typography.css, rem)
const BROWSER_FONT_PX = 20;
const REM_PX = 16;
const FONT_XS_REM = 12 / REM_PX;
const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
// * lg is 64rem: 1280px at a 20px default, so 1200px is below it and 1300px above
const BELOW_LG_PX = 1200;
const ABOVE_LG_PX = 1300;

/** The browser's own default font size, as set in its preferences (Chromium, through CDP). */
async function setBrowserFontSize(page: Page, px: number) {
  const session = await page.context().newCDPSession(page);
  await session.send("Page.enable");
  await session.send("Page.setFontSizes", { fontSizes: { standard: px } });
}

const computedFontSize = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));

test.describe("the browser's default font size", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: ABOVE_LG_PX, height: 900 });
    await setBrowserFontSize(page, BROWSER_FONT_PX);
    await page.goto(CITY_URL);
  });

  test("scales the root, body text and every token by the same ratio", async ({ page }) => {
    expect(await computedFontSize(page, "html")).toBe(BROWSER_FONT_PX);
    expect(await computedFontSize(page, "body")).toBe(BROWSER_FONT_PX);
    const label = page.getByRole("complementary").getByText("Dataset", { exact: true });
    await expect(label).toBeVisible();
    expect(await label.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBe(
      BROWSER_FONT_PX * FONT_XS_REM,
    );
  });

  test("moves the layout's breakpoints with it, in CSS and in JS alike", async ({ page }) => {
    const sidebar = page.getByRole("complementary", { name: "Filters" });
    const matchesLg = () =>
      page.evaluate((query) => window.matchMedia(query).matches, LG_MEDIA_QUERY);

    await expect(sidebar).toBeVisible();
    expect(await matchesLg()).toBe(true);

    await page.setViewportSize({ width: BELOW_LG_PX, height: 900 });
    await expect(sidebar).toBeHidden();
    expect(await matchesLg()).toBe(false);
  });
});
