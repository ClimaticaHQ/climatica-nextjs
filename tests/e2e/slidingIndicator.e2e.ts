import { expect, test, type Locator, type Page } from "@playwright/test";

const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
const DESKTOP = { width: 1440, height: 900 };
// * px — sub-pixel rounding between the indicator's box and its item's
const ALIGN_TOLERANCE_PX = 0.5;
const POLL = { timeout: 5_000 };

const navbar = (page: Page) => page.getByRole("banner");
const pill = (page: Page) => navbar(page).locator("[data-sliding-indicator]");
const infoPanel = (page: Page) =>
  page
    .getByRole("complementary")
    .filter({ has: page.getByRole("navigation", { name: "Info pages" }) });
const sectionBar = (page: Page) => infoPanel(page).locator("[data-sliding-indicator]");

/** How far the indicator's box is from its item's, the largest side. */
const offsetFrom = async (indicator: Locator, item: Locator, isVertical = false) => {
  const [a, b] = await Promise.all([indicator.boundingBox(), item.boundingBox()]);
  if (!a || !b) return Infinity;
  const vertical = [a.y - b.y, a.height - b.height];
  const horizontal = isVertical ? [] : [a.x - b.x, a.width - b.width];
  return Math.max(...[...vertical, ...horizontal].map(Math.abs));
};

/** Holds every navigation's page data until the returned function is called. */
async function holdNavigations(page: Page) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*", async (route) => {
    if (route.request().headers()["rsc"]) await gate;
    await route.continue();
  });
  return release;
}

const runningTransitions = (indicator: Locator) =>
  indicator.evaluate((element) => element.getAnimations().length);

test.describe("sliding indicators", () => {
  test.use({ viewport: DESKTOP });

  test("the navbar's pill moves to About on click, before the page arrives, and stays", async ({
    page,
  }) => {
    await page.goto(CITY_URL);
    await expect(pill(page)).toBeAttached();
    const about = navbar(page).getByRole("link", { name: "About", exact: true });
    const release = await holdNavigations(page);
    await about.click();
    await expect.poll(() => offsetFrom(pill(page), about), POLL).toBeLessThan(ALIGN_TOLERANCE_PX);
    expect(new URL(page.url()).pathname).toBe("/climate-statistics");
    release();
    await page.waitForURL("**/about");
    await expect(about).toHaveAttribute("aria-current", "page");
    expect(await offsetFrom(pill(page), about)).toBeLessThan(ALIGN_TOLERANCE_PX);
  });

  test("scrolling to Privacy puts the section bar beside Privacy", async ({ page }) => {
    await page.goto("/about");
    await expect(sectionBar(page)).toBeAttached();
    await page.locator("main").evaluate((main) => main.scrollTo({ top: main.scrollHeight }));
    const privacy = infoPanel(page).getByRole("link", { name: "Privacy" });
    await expect(privacy).toHaveAttribute("aria-current", "location");
    await expect
      .poll(() => offsetFrom(sectionBar(page), privacy, true), POLL)
      .toBeLessThan(ALIGN_TOLERANCE_PX);
  });

  test("on a reload the indicators are already in place, with no transition running", async ({
    page,
  }) => {
    await page.goto("/about/guide");
    await page.reload();
    await expect(pill(page)).toBeAttached();
    await expect(sectionBar(page)).toBeAttached();
    expect(await runningTransitions(pill(page))).toBe(0);
    expect(await runningTransitions(sectionBar(page))).toBe(0);
    const about = navbar(page).getByRole("link", { name: "About", exact: true });
    expect(await offsetFrom(pill(page), about)).toBeLessThan(ALIGN_TOLERANCE_PX);
  });

  test("with reduced motion the indicators jump, no transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about/guide");
    await expect(sectionBar(page)).toBeAttached();
    const last = infoPanel(page).getByRole("link", { name: "Questions" });
    await last.click();
    await expect(last).toHaveAttribute("aria-current", "location");
    expect(await runningTransitions(sectionBar(page))).toBe(0);
    expect(await sectionBar(page).evaluate((bar) => getComputedStyle(bar).transitionDuration)).toBe(
      "0s",
    );
    expect(await offsetFrom(sectionBar(page), last, true)).toBeLessThan(ALIGN_TOLERANCE_PX);
    await navbar(page).getByRole("link", { name: "City Climate" }).click();
    expect(await runningTransitions(pill(page))).toBe(0);
    expect(
      await pill(page).evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe("0s");
  });
});
