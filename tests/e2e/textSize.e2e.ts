import {
  CHART_TEXT_MIN_PX,
  LOCAL_STORAGE_KEYS,
  SETTINGS_STORE_VERSION,
  TEXT_SCALE_PROPERTY,
  TEXT_SIZE_SCALES,
  WALTER_LIETH_AXIS,
} from "@/constants";
import { EBadgeSize, ETextSize } from "@/enums";
import { expect, test, type Page } from "@playwright/test";

const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
const MAIN_PAGES = [
  CITY_URL,
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522",
  "/compare-periods?city=Paris&lat=48.8566&lng=2.3522",
  "/heat-map?dataset=climate&period=c1970-2000&north=50&south=49&west=23&east=24&grid=10m&var=tmax",
  "/about",
  "/about/guide",
  "/about/data",
  "/settings",
];
const BASE_PX = 16;
const BROWSER_PX = 20;
const MIN_TARGET_PX = 44;
const LARGER = TEXT_SIZE_SCALES[ETextSize.LARGER];
const ALLOWED_ELLIPSIS =
  '[data-breadcrumb-page], [role="group"][aria-label="Place highlighted on the map"] span';
const SMALL_TARGET_EXCEPTIONS = '[aria-label="Swap periods"]';
const MIN_TEXT_PX = 11;
const SMALL_TEXT_EXCEPTIONS = `[data-badge-size="${EBadgeSize.SM}"] *, [data-badge-size="${EBadgeSize.SM}"]`;

const saveTextSize = (page: Page, textSize: ETextSize) =>
  page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
    key: LOCAL_STORAGE_KEYS.SETTINGS,
    value: JSON.stringify({ state: { textSize }, version: SETTINGS_STORE_VERSION }),
  });

async function setBrowserFontSize(page: Page, px: number) {
  const session = await page.context().newCDPSession(page);
  await session.send("Page.enable");
  await session.send("Page.setFontSizes", { fontSizes: { standard: px } });
}

const fontSizeOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));

const textSizeSlider = (page: Page) => page.getByRole("slider", { name: "Text size" });

const TICK = ".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value";

async function exportSvgFontSizes(page: Page) {
  await page.goto(CITY_URL);
  const exportButton = page.getByRole("button", { name: "Export data" });
  await expect(exportButton).toBeEnabled({ timeout: 30_000 });
  await exportButton.click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG vector" }).click();
  const path = await (await download).path();
  const { readFile } = await import("node:fs/promises");
  const svg = await readFile(path, "utf8");
  return [...svg.matchAll(/font-size="([\d.]+)"/g)].map(([, size]) => size);
}

const findLayoutProblems = (page: Page, isPhone: boolean) =>
  page.evaluate(
    ({ isPhone, minTarget, allowedEllipsis, smallTargets }) => {
      const problems: string[] = [];
      const root = document.documentElement;
      if (root.scrollWidth > root.clientWidth + 1) problems.push("the page scrolls sideways");
      const name = (element: Element) =>
        `${element.tagName} "${(element.textContent ?? "").trim().slice(0, 40)}"`;
      for (const element of document.querySelectorAll("body *")) {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        if (style.visibility === "hidden" || box.width <= 1 || box.height <= 1) continue;
        if (element.closest("svg, .leaflet-container, [aria-hidden=true]")) continue;
        const hasText = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        );
        if (!hasText) continue;
        const isCutX =
          style.overflowX !== "visible" && element.scrollWidth > element.clientWidth + 1;
        const isCutY =
          (style.overflowY === "hidden" || style.overflowY === "clip") &&
          style.webkitLineClamp === "none" &&
          element.scrollHeight > element.clientHeight + 1;
        if ((isCutX || isCutY) && !element.matches(allowedEllipsis)) {
          problems.push(`cut text: ${name(element)}`);
        }
      }
      if (!isPhone) return problems;
      // * inline links inside a sentence are exempt from the target size (WCAG 2.5.5)
      for (const element of document.querySelectorAll("button, a[href], summary")) {
        const box = element.getBoundingClientRect();
        // * and so are the map's own controls (Leaflet's)
        if (box.width <= 1 || element.closest("p, [aria-hidden=true], .leaflet-container"))
          continue;
        if (element.matches(smallTargets) || getComputedStyle(element).pointerEvents === "none")
          continue;
        const before = getComputedStyle(element, "::before");
        const target =
          before.position === "absolute" ? Math.max(box.height, parseFloat(before.height)) : 0;
        if (Math.round(Math.max(box.height, target)) < minTarget) {
          problems.push(`small target: ${name(element)} ${Math.round(box.height)}px`);
        }
      }
      return problems;
    },
    {
      isPhone,
      minTarget: MIN_TARGET_PX,
      allowedEllipsis: ALLOWED_ELLIPSIS,
      smallTargets: SMALL_TARGET_EXCEPTIONS,
    },
  );

const findSmallestText = (page: Page) =>
  page.evaluate((exceptions) => {
    const sizes = { html: Infinity, tick: Infinity, chart: Infinity };
    for (const element of document.querySelectorAll("body *")) {
      if (element.closest(".leaflet-container, .sr-only, #recharts_measurement_span")) continue;
      if (element.matches(exceptions)) continue;
      const hasText = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      );
      const box = element.getBoundingClientRect();
      if (!hasText || box.width <= 1 || !element.checkVisibility({ opacityProperty: true }))
        continue;
      const size = parseFloat(getComputedStyle(element).fontSize);
      const kind = !element.closest("svg")
        ? "html"
        : element.closest(".recharts-cartesian-axis-tick-value")
          ? "tick"
          : "chart";
      sizes[kind] = Math.min(sizes[kind], size);
    }
    return sizes;
  }, SMALL_TEXT_EXCEPTIONS);

test.describe("text size setting", () => {
  test("applies the saved size before the first paint: no shift on reload", async ({ page }) => {
    await saveTextSize(page, ETextSize.LARGER);
    // * the scale <html> carries when <body> starts: the head script's, before React runs
    await page.addInitScript((property) => {
      new MutationObserver((_, observer) => {
        if (document.body === null) return;
        Object.assign(window, {
          scaleAtBody: document.documentElement.style.getPropertyValue(property),
        });
        observer.disconnect();
      }).observe(document, { childList: true, subtree: true });
    }, TEXT_SCALE_PROPERTY);
    await page.goto("/settings");
    await page.reload();

    expect(await page.evaluate(() => Reflect.get(window, "scaleAtBody"))).toBe(String(LARGER));
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            resolve(list.getEntries().reduce((sum, entry) => sum + Reflect.get(entry, "value"), 0));
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(0), 500);
        }),
    );
    expect(shift).toBe(0);
  });

  test("changing it resizes body text and the chart's ticks", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(page.locator(TICK).first()).toBeVisible({ timeout: 30_000 });
    expect(await fontSizeOf(page, "body")).toBe(BASE_PX);
    expect(await fontSizeOf(page, TICK)).toBe(WALTER_LIETH_AXIS.TICK_FONT_SIZE);

    await page.goto("/settings");
    await textSizeSlider(page).press("End");
    await expect(textSizeSlider(page)).toHaveAttribute("aria-valuetext", "Larger");
    expect(await fontSizeOf(page, "body")).toBe(BASE_PX * LARGER);

    await page.getByRole("link", { name: "City Climate" }).first().click();
    await expect(page.locator(TICK).first()).toBeVisible({ timeout: 30_000 });
    expect(await fontSizeOf(page, TICK)).toBe(WALTER_LIETH_AXIS.TICK_FONT_SIZE * LARGER);
  });

  test("leaves the exported SVG's sizes as they are", async ({ page, browser }) => {
    const atDefault = await exportSvgFontSizes(page);
    expect(atDefault.length).toBeGreaterThan(0);
    for (const textSize of [ETextSize.SMALLER, ETextSize.LARGER]) {
      const other = await browser.newPage();
      await saveTextSize(other, textSize);
      expect(await exportSvgFontSizes(other), textSize).toEqual(atDefault);
      await other.close();
    }
  });
});

for (const { width, browserPx } of [
  { width: 360, browserPx: BASE_PX },
  { width: 1440, browserPx: BASE_PX },
  { width: 360, browserPx: BROWSER_PX },
  { width: 1440, browserPx: BROWSER_PX },
]) {
  test.describe(`Larger text at ${width}px, a ${browserPx}px browser default`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: width < 1024 });
    test.setTimeout(120_000);

    test("no sideways scroll, no cut text, targets of 44px below lg", async ({ page }) => {
      await saveTextSize(page, ETextSize.LARGER);
      await setBrowserFontSize(page, browserPx);
      for (const url of MAIN_PAGES) {
        await page.goto(url);
        await page.waitForLoadState("networkidle");
        expect(await findLayoutProblems(page, width < 1024), url).toEqual([]);
      }
    });
  });
}

for (const width of [360, 1440]) {
  test.describe(`Smaller text at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: width < 1024 });
    test.setTimeout(120_000);

    test("text at its floors, no sideways scroll or cut text, 44px targets below lg", async ({
      page,
    }) => {
      await saveTextSize(page, ETextSize.SMALLER);
      for (const url of MAIN_PAGES) {
        await page.goto(url);
        await page.waitForLoadState("networkidle");
        const smallest = await findSmallestText(page);
        expect(smallest.html, url).toBeGreaterThanOrEqual(MIN_TEXT_PX);
        expect(smallest.tick, url).toBeGreaterThanOrEqual(CHART_TEXT_MIN_PX.TICK);
        expect(smallest.chart, url).toBeGreaterThanOrEqual(CHART_TEXT_MIN_PX.TEXT);
        expect(await findLayoutProblems(page, width < 1024), url).toEqual([]);
      }
    });
  });
}

test.describe("the navbar at lg", () => {
  test.use({ viewport: { width: 1024, height: 700 } });

  const navLink = (page: Page) => page.locator("header nav").getByRole("link").first();
  const menuButton = (page: Page) => page.getByRole("button", { name: "Toggle menu" });

  test("shows its links while they fit on one line", async ({ page }) => {
    await page.goto("/settings");
    await expect(navLink(page)).toBeVisible();
    await expect(menuButton(page)).toBeHidden();
  });

  test("falls back to its menu when larger text no longer fits", async ({ page }) => {
    await saveTextSize(page, ETextSize.LARGER);
    await page.goto("/settings");
    await expect(menuButton(page)).toBeVisible();
    await expect(navLink(page)).toBeHidden();
    await menuButton(page).click();
    await expect(page.getByRole("link", { name: "Compare Periods" })).toBeVisible();
  });
});

const rootFontSize = (page: Page) => fontSizeOf(page, "html");

const sliderBoxes = (page: Page) =>
  page.locator("[data-step-slider]").evaluate((root) => {
    const row = root.closest("section > div > div")?.firstElementChild ?? null;
    const box = (element: Element | null) => {
      const { left, right, top, bottom, width, height } =
        element?.getBoundingClientRect() ?? new DOMRect();
      return { left, right, top, bottom, width, height };
    };
    return {
      root: box(root),
      input: box(root.querySelector("input")),
      row: box(row),
      text: box(row?.querySelector("span") ?? null),
    };
  });

test.describe("the text size slider", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("reads as Text size with the step's name, and starts at Default", async ({ page }) => {
    await page.goto("/settings");
    await expect(textSizeSlider(page)).toHaveAttribute("aria-valuetext", "Default");
    await expect(page.locator("[data-step-dot]")).toHaveCount(5);
  });

  test("a drag changes nothing until release, then applies", async ({ page }) => {
    await page.goto("/settings");
    const { input } = await sliderBoxes(page);
    const y = input.top + input.height / 2;
    await page.mouse.move(input.left + input.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(input.right - 4, y, { steps: 8 });
    await expect(textSizeSlider(page)).toHaveAttribute("aria-valuetext", "Larger");
    expect(await rootFontSize(page)).toBe(BASE_PX);
    await page.mouse.up();
    await expect.poll(() => rootFontSize(page)).toBe(BASE_PX * LARGER);
  });

  test("each key step applies at once", async ({ page }) => {
    await page.goto("/settings");
    await textSizeSlider(page).press("ArrowLeft");
    expect(await rootFontSize(page)).toBe(BASE_PX * TEXT_SIZE_SCALES[ETextSize.SMALL]);
    await textSizeSlider(page).press("Home");
    expect(await rootFontSize(page)).toBe(BASE_PX * TEXT_SIZE_SCALES[ETextSize.SMALLER]);
  });

  test("keeps one track width at every text size, beside its label", async ({ page }) => {
    const widths = [];
    for (const textSize of [ETextSize.SMALLER, ETextSize.LARGER]) {
      await saveTextSize(page, textSize);
      await page.goto("/settings");
      const { input, root, text } = await sliderBoxes(page);
      expect(root.left).toBeGreaterThan(text.right);
      widths.push(input.width);
    }
    expect(widths[0]).toBeCloseTo(widths[1] ?? 0, 0);
  });
});

test.describe("the text size slider on a phone", () => {
  test.use({ viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true });

  for (const [width, textSize] of [
    [430, ETextSize.SMALLER],
    [360, ETextSize.LARGER],
  ] as const) {
    test(`a 44px target (${width}px, ${textSize}); under its label at full width when it doesn't fit beside`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await saveTextSize(page, textSize);
      await page.goto("/settings");
      const { input, root, row, text } = await sliderBoxes(page);
      expect(input.height).toBeGreaterThanOrEqual(MIN_TARGET_PX);
      if (textSize === ETextSize.LARGER) {
        expect(root.top).toBeGreaterThanOrEqual(text.bottom);
        expect(root.width).toBeCloseTo(row.width, 0);
      } else {
        expect(root.left).toBeGreaterThan(text.right);
      }
    });
  }

  test("names the slider in every language (de)", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "de", url: baseURL ?? "" }]);
    await page.goto("/settings");
    const slider = page.getByRole("slider", { name: "Textgröße" });
    await expect(slider).toHaveAttribute("aria-valuetext", "Standard");
  });
});

const chipOf = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).first();
const pressed = (page: Page, name: string) => chipOf(page, name).getAttribute("aria-pressed");

for (const textSize of [ETextSize.DEFAULT, ETextSize.LARGER]) {
  test.describe(`chip tap targets at 360px, ${textSize} text`, () => {
    test.use({ viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true });

    test.beforeEach(async ({ page }) => {
      await saveTextSize(page, textSize);
      await page.goto(`${CITY_URL}&chart=standard`);
      await expect(chipOf(page, "Min temp")).toBeVisible({ timeout: 30_000 });
      await chipOf(page, "Min temp").scrollIntoViewIfNeeded();
    });

    test("a tap just under a chip's pill toggles that chip, and only it", async ({ page }) => {
      const box = await chipOf(page, "Min temp").boundingBox();
      if (box === null) throw new Error("no chip");
      const before = { min: await pressed(page, "Min temp"), max: await pressed(page, "Max temp") };
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height + 2);
      await expect(chipOf(page, "Min temp")).not.toHaveAttribute("aria-pressed", before.min ?? "");
      expect(await pressed(page, "Max temp")).toBe(before.max);
    });

    // * the browser snaps a tap in a gap to the nearer target (touch adjustment): at most one
    test("a tap midway between two chips never toggles both", async ({ page }) => {
      const left = await chipOf(page, "Min temp").boundingBox();
      const right = await chipOf(page, "Avg temp").boundingBox();
      if (left === null || right === null) throw new Error("no chips");
      const before = [await pressed(page, "Min temp"), await pressed(page, "Avg temp")];
      await page.touchscreen.tap((left.x + left.width + right.x) / 2, left.y + left.height / 2);
      // * give a stray toggle time to show
      await page.waitForTimeout(300);
      const after = [await pressed(page, "Min temp"), await pressed(page, "Avg temp")];
      expect(after.filter((state, index) => state !== before[index]).length).toBeLessThan(2);
    });
  });
}
