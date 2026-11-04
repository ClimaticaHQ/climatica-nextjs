import { devices, expect, test, type Locator, type Page } from "@playwright/test";

// * the touch scale (tokens.css): what phones must get, in px
const MIN_PX = {
  BODY: 16,
  CHIP: 15,
  SECONDARY: 15,
  LABEL: 14,
  TITLE: 18,
  NAV: 17,
  NAV_PAGE: 19,
  BUTTON: 17,
  TARGET: 44,
} as const;
// * the TOUCH chip's visible pill: 36 px — under the 44 px target its ::before reaches
const CHIP_PILL_PX = 36;
// * the variables a Walter-Lieth diagram draws: selected, and disabled in that view
const WALTER_LIETH_VARIABLES = ["Max temp", "Min temp", "Precip"];
// * WCAG AA for text
const MIN_CONTRAST = 4.5;
const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";

const fontSize = (locator: Locator) =>
  locator.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));

/** Every matched element's computed font size, smallest first. */
const fontSizes = (locator: Locator) =>
  locator.evaluateAll((elements) =>
    elements.map((element) => parseFloat(getComputedStyle(element).fontSize)).sort((a, b) => a - b),
  );

/** Text against the first ancestor that paints a background, after the element's opacity. */
const contrastOf = (locator: Locator) =>
  locator.evaluate((element) => {
    const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
    const luminance = ([r = 0, g = 0, b = 0]: number[]) => {
      const [lr, lg, lb] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * (lr ?? 0) + 0.7152 * (lg ?? 0) + 0.0722 * (lb ?? 0);
    };
    let node: Element | null = element;
    let opacity = 1;
    let background = [255, 255, 255];
    for (; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= parseFloat(style.opacity);
      const bg = rgb(style.backgroundColor);
      if ((bg[3] ?? 1) > 0 && style.backgroundColor !== "transparent") {
        background = bg.slice(0, 3);
        break;
      }
    }
    const text = rgb(getComputedStyle(element).color).slice(0, 3);
    const seen = text.map((c, i) => c * opacity + (background[i] ?? 0) * (1 - opacity));
    const [a, b] = [luminance(seen), luminance(background)].sort((x, y) => y - x);
    return ((a ?? 0) + 0.05) / ((b ?? 0) + 0.05);
  });

/** The drawn variables: disabled, still pressed, and drawn apart from the unselected ones. */
async function expectSelectedAndDisabled(scope: Locator) {
  const backgrounds = new Set<string>();
  for (const name of WALTER_LIETH_VARIABLES) {
    const chip = scope.getByRole("button", { name, exact: true });
    await expect(chip).toBeDisabled();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    backgrounds.add(await chip.evaluate((element) => getComputedStyle(element).backgroundColor));
  }
  const unselected = scope.getByRole("button", { name: "Wind", exact: true });
  await expect(unselected).toBeDisabled();
  await expect(unselected).toHaveAttribute("aria-pressed", "false");
  const unselectedBackground = await unselected.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(backgrounds.size).toBe(1);
  expect(backgrounds.has(unselectedBackground)).toBe(false);
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => {
    const main = document.querySelector("main");
    return Math.max(
      document.documentElement.scrollWidth - window.innerWidth,
      main ? main.scrollWidth - main.clientWidth : 0,
    );
  });
  expect(overflow).toBeLessThanOrEqual(0);
}

// * the phone's screen and touch, not its browser type: that would need a worker of its own
const { userAgent, deviceScaleFactor, isMobile, hasTouch } = devices["Pixel 7"];
test.use({ userAgent, deviceScaleFactor, isMobile, hasTouch });

for (const width of [360, 390]) {
  test.describe(`touch typography at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test("the Info contents bar and sheet", async ({ page }) => {
      await page.goto("/about/data");
      await page
        .getByRole("heading", { name: "Climate indicators", level: 2 })
        .evaluate((heading) => heading.closest("section")?.scrollIntoView());
      const bar = page.getByRole("navigation", { name: "You are here" });
      await expect(bar).toHaveText("Data & methodsClimate indicators");
      expect(await fontSize(bar)).toBeGreaterThanOrEqual(MIN_PX.NAV);
      const contents = page.getByRole("button", { name: "Contents" });
      expect(await fontSize(contents)).toBeGreaterThanOrEqual(MIN_PX.NAV);

      // * the current section is never cut: wholly shown, on up to two lines
      const section = bar.locator("span").last();
      expect(
        await section.evaluate(
          (element) =>
            element.scrollHeight <= element.clientHeight &&
            element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      await expectNoHorizontalScroll(page);

      await contents.click();
      const sheet = page.getByRole("dialog", { name: "Contents" });
      expect(
        await fontSize(sheet.getByRole("heading", { name: "Contents" })),
      ).toBeGreaterThanOrEqual(MIN_PX.TITLE);
      const pageLink = sheet.getByRole("link", { name: "User guide" });
      expect(await fontSize(pageLink)).toBeGreaterThanOrEqual(MIN_PX.NAV_PAGE);
      expect((await pageLink.boundingBox())?.height).toBeGreaterThanOrEqual(48);
      const sectionLink = sheet.getByRole("link", { name: "References" });
      expect(await fontSize(sectionLink)).toBeGreaterThanOrEqual(MIN_PX.NAV);
      expect((await sectionLink.boundingBox())?.height).toBeGreaterThanOrEqual(MIN_PX.TARGET);
    });

    test("the filters sheet", async ({ page }) => {
      await page.goto(CITY_URL);
      await page.getByRole("button", { name: /^Filters/ }).click();
      const sheet = page.getByRole("dialog", { name: "Filters" });
      await expect(sheet).toBeVisible();

      expect(
        await fontSize(sheet.getByRole("heading", { name: "Filters" })),
      ).toBeGreaterThanOrEqual(MIN_PX.TITLE);
      const chips = sheet.locator("button[aria-pressed]");
      expect((await fontSizes(chips))[0]).toBeGreaterThanOrEqual(MIN_PX.CHIP);
      // * whole px: a scaled device reports 43.9999 for a 44 px box
      const boxes = await chips.evaluateAll((elements) =>
        elements.map((element) => ({
          pill: Math.round(element.getBoundingClientRect().height),
          target: Math.round(parseFloat(getComputedStyle(element, "::before").height)),
        })),
      );
      for (const { pill, target } of boxes) {
        expect(pill).toBe(CHIP_PILL_PX);
        expect(pill).toBeLessThan(MIN_PX.TARGET);
        expect(target).toBeGreaterThanOrEqual(MIN_PX.TARGET);
      }
      // * a tap just above a chip's pill, inside its target, lands on that chip — not a neighbour
      const climate = sheet.getByRole("button", { name: "Climate", exact: true });
      const landsOnChip = await climate.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const hit = document.elementFromPoint(box.left + box.width / 2, box.top - 3);
        return hit?.closest("button") === element;
      });
      expect(landsOnChip).toBe(true);
      // * every select / input / dropdown trigger: ≥ 16 px, or iOS Safari zooms on focus
      const triggers = sheet.locator("button[aria-expanded], input, select");
      expect((await fontSizes(triggers))[0]).toBeGreaterThanOrEqual(MIN_PX.BODY);
      expect((await fontSizes(page.locator("main input")))[0]).toBeGreaterThanOrEqual(MIN_PX.BODY);
      expect(await fontSize(sheet.getByText("Variables", { exact: true }))).toBeGreaterThanOrEqual(
        MIN_PX.LABEL,
      );
      expect(
        await fontSize(sheet.getByRole("link", { name: "What do resolutions mean?" })),
      ).toBeGreaterThanOrEqual(MIN_PX.BODY);
      for (const name of ["Reset", "Apply"]) {
        expect(await fontSize(sheet.getByRole("button", { name }))).toBeGreaterThanOrEqual(
          MIN_PX.BUTTON,
        );
      }

      // * the chips wrap inside the sheet: none reaches past its edge
      const sheetBox = await sheet.boundingBox();
      const rightmost = await chips.evaluateAll((elements) =>
        Math.max(...elements.map((element) => element.getBoundingClientRect().right)),
      );
      expect(rightmost).toBeLessThanOrEqual((sheetBox?.x ?? 0) + (sheetBox?.width ?? 0));
    });

    test("Walter-Lieth view: the drawn variables stay selected; the note is legible", async ({
      page,
    }) => {
      await page.goto(CITY_URL);
      await page.getByRole("button", { name: /^Filters/ }).click();
      const sheet = page.getByRole("dialog", { name: "Filters" });
      await expectSelectedAndDisabled(sheet);
      // * the note carries the explanation, so it — not the disabled chip — meets AA
      const note = sheet.getByText("Not available", { exact: false }).first();
      expect(await fontSize(note)).toBeGreaterThanOrEqual(MIN_PX.SECONDARY);
      expect(await contrastOf(note)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    });

    test("the filter bar's unavailable pill is a button that explains", async ({ page }) => {
      await page.goto(CITY_URL);
      const pill = page.getByRole("button", { name: /^Variables: .*Show why$/ });
      await expect(pill).toBeEnabled();
      await expect(pill).not.toHaveAttribute("aria-disabled", /.*/);
      await pill.focus();
      await expect(pill).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("dialog", { name: "Walter-Lieth diagram" })).toBeVisible();
    });
  });
}

// * the disabled look is shared: on the desktop sidebar too, the drawn variables stay selected and
// * the notes meet AA
test.describe("disabled chips on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

  test("Walter-Lieth: the sidebar's chips and their note", async ({ page }) => {
    await page.goto(CITY_URL);
    const sidebar = page.locator("aside");
    await expectSelectedAndDisabled(sidebar);
    const note = sidebar.getByText("Not available in Walter-Lieth view").first();
    expect(await contrastOf(note)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  test("heat map: the month chips are disabled, the note above them never faded", async ({
    page,
  }) => {
    await page.goto("/heat-map");
    const sidebar = page.locator("aside");
    const months = sidebar.getByRole("button", { name: "All", exact: true });
    await expect(months).toBeDisabled();
    // * colour, not opacity: a selected chip can keep its cue
    for (const chip of await sidebar.locator("button[aria-pressed]:disabled").all()) {
      expect(await chip.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
    }
    const notes = sidebar.getByText("Not available for region heatmap");
    await expect(notes.first()).toBeVisible();
    for (const note of await notes.all()) {
      expect(await contrastOf(note)).toBeGreaterThanOrEqual(MIN_CONTRAST);
    }
  });
});
