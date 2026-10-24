import { expect, test, type Locator, type Page } from "@playwright/test";

const CITY_URL = "/climate-statistics?city=Madrid&lat=40.4168&lng=-3.7038";
const CITIES_URL =
  "/compare-cities?cityA=Guadalajara&latA=20.6774&lngA=-103.3475&cityB=Rome&latB=41.9028&lngB=12.4964&layout=overlay";

// * a phone with a touchscreen: no hover, a coarse pointer
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const card = (page: Page) => page.getByTestId("climate-chart");
const tapLayer = (page: Page) => card(page).locator("[data-month-tap-layer]").first();
const tooltip = (page: Page) => card(page).locator(".recharts-tooltip-wrapper").first();

async function openChart(page: Page, url: string) {
  await page.goto(url);
  await expect(tapLayer(page)).toBeVisible({ timeout: 30_000 });
}

// * a part's place in the card (the page may scroll between views)
const placeOf = async (page: Page, locator: Locator) => {
  const [box, frame] = [await locator.boundingBox(), await card(page).boundingBox()];
  if (!box || !frame) throw new Error("not laid out");
  return { y: Math.round(box.y - frame.y), height: Math.round(box.height) };
};

/** A tap on the visible plot, at a share of its width. */
async function tapPlot(page: Page, share: number) {
  const layer = tapLayer(page);
  await layer.scrollIntoViewIfNeeded();
  const box = await layer.boundingBox();
  if (!box) throw new Error("no plot");
  await page.touchscreen.tap(box.x + box.width * share, box.y + box.height * 0.7);
}

test.describe("charts on a phone, by touch", () => {
  test("City Climate: Standard ↔ Walter-Lieth moves nothing and leaves no blank under the header", async ({
    page,
  }) => {
    await openChart(page, `${CITY_URL}&chart=standard`);
    const toolbar = card(page).locator("[data-chart-controls]");
    const header = card(page).locator(".\\@container").first();
    const measure = async () => ({
      toolbar: await placeOf(page, toolbar),
      plot: (await placeOf(page, tapLayer(page))).y,
    });
    const standard = await measure();

    await card(page).getByRole("button", { name: "Walter-Lieth diagram" }).click();
    await expect(page).not.toHaveURL(/chart=standard/);
    await expect(tapLayer(page)).toBeVisible({ timeout: 30_000 });
    await expect.poll(measure).toEqual(standard);

    // * the guide fills the toolbar row, right under the header — no empty band
    const guide = toolbar.getByRole("button", { name: "How to read this diagram" });
    await expect(guide).toBeVisible();
    const [headerBox, toolbarBox, guideBox] = [
      await header.boundingBox(),
      await toolbar.boundingBox(),
      await guide.boundingBox(),
    ];
    expect(toolbarBox!.y - (headerBox!.y + headerBox!.height)).toBeLessThanOrEqual(16);
    expect(guideBox!.y - toolbarBox!.y).toBeLessThanOrEqual(4);
    await expect(card(page).locator("[data-chart-readout]")).toHaveCount(0);
  });

  test("a tap shows the month's tooltip pinned to the plot's top; a tap outside closes it", async ({
    page,
  }) => {
    await openChart(page, `${CITY_URL}&chart=standard`);
    await expect(tooltip(page)).toBeHidden();

    await tapPlot(page, 0.62);
    await expect(tooltip(page)).toBeVisible();
    await expect(card(page).locator(".recharts-reference-area")).toHaveCount(1);
    const [tip, plot, frame] = [
      await tooltip(page).boundingBox(),
      await tapLayer(page).boundingBox(),
      await card(page).boundingBox(),
    ];
    // * at the plot's top, not under the finger — and inside the card
    expect(tip!.y - plot!.y).toBeLessThan(40);
    expect(tip!.x).toBeGreaterThanOrEqual(frame!.x);
    expect(tip!.x + tip!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);

    await page.getByRole("heading", { level: 1 }).tap();
    await expect(tooltip(page)).toBeHidden();
    await expect(card(page).locator(".recharts-reference-area")).toHaveCount(0);
  });

  test("Compare Cities, two cities: the year scrolls sideways from January under fixed axes", async ({
    page,
  }) => {
    await openChart(page, `${CITIES_URL}&chart=standard`);
    const scroller = card(page).locator("[data-overlay-scroller]");
    await expect(scroller).toBeVisible();
    await expect(card(page).locator("[data-fixed-axis]")).toHaveCount(2);
    await expect(card(page).getByText("Swipe to see every month")).toBeVisible();
    const { scrollLeft, overflow } = await scroller.evaluate((element) => ({
      scrollLeft: element.scrollLeft,
      overflow: element.scrollWidth - element.clientWidth,
    }));
    expect(scrollLeft).toBe(0);
    expect(overflow).toBeGreaterThan(100);
    // * the bars at their phone width
    const width = await card(page)
      .locator(".recharts-bar-rectangle rect:not([data-bar-hatch])")
      .first()
      .evaluate((rect) => Number(rect.getAttribute("width")));
    expect(width).toBeCloseTo(14, 0);
  });

  test("a comparison's title wraps rather than being cut", async ({ page }) => {
    await openChart(page, `${CITIES_URL}&chart=standard`);
    const names = card(page).locator("h3 > span");
    await expect(names).toHaveCount(3);
    for (const name of await names.all()) {
      const isCut = await name.evaluate(
        (element) =>
          element.scrollWidth > element.clientWidth + 1 ||
          getComputedStyle(element).textOverflow === "ellipsis",
      );
      expect(isCut).toBe(false);
    }
  });

  test("the card frame is the same on City Climate and Compare Cities", async ({ page }) => {
    const frameOf = async (url: string) => {
      await openChart(page, url);
      return card(page)
        .locator("[data-chart-controls]")
        .evaluate((toolbar) => {
          let element: HTMLElement | null = toolbar.parentElement;
          while (element && getComputedStyle(element).borderTopWidth === "0px") {
            element = element.parentElement;
          }
          if (!element) return null;
          const style = getComputedStyle(element);
          return {
            border: style.borderTopWidth,
            radius: style.borderTopLeftRadius,
            padding: style.paddingLeft,
            background: style.backgroundColor,
          };
        });
    };
    const city = await frameOf(`${CITY_URL}&chart=standard`);
    expect(city).not.toBeNull();
    expect(await frameOf(`${CITIES_URL}&chart=standard`)).toEqual(city);
  });
});
