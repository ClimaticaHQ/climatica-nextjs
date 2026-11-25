import { devices, expect, test, type Page } from "@playwright/test";

const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
const COMPARE_URL =
  "/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522&layout=overlay&chart=standard&dataset=weather";

const FIVE_YEARS_URL =
  "/compare-periods?city=Madrid&lat=40.4168&lng=-3.7038&dataset=weather&periods=2021,1967,1990,2010,2000&layout=overlay&chart=standard";

const settingsHeading = (page: Page) => page.getByRole("heading", { level: 1, name: "Settings" });
const barStyleGroup = (page: Page) =>
  page.getByRole("radiogroup", { name: "Comparison bar style" });
const overlayBars = (page: Page) =>
  page.evaluate(() => {
    const bars = [
      ...document.querySelectorAll(".recharts-bar-rectangle rect:not([data-bar-hatch])"),
    ];
    return {
      count: bars.length,
      shaded: bars.filter((bar) => bar.getAttribute("fill")?.includes("-shade-")).length,
      hatches: document.querySelectorAll(".recharts-bar-rectangle rect[data-bar-hatch]").length,
    };
  });

test.describe("Settings page", () => {
  test("the gear opens it, marked as the current page; no filters there", async ({ page }) => {
    await page.goto(CITY_URL);
    const gear = page.getByRole("link", { name: "Settings" });
    await gear.click();

    await expect(settingsHeading(page)).toBeVisible();
    await expect(page).toHaveURL(/\/settings(\?|$)/);
    await expect(gear).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("complementary", { name: "Filters" })).toHaveCount(0);
    await expect(page.getByText("Language, appearance and how the app behaves")).toBeVisible();
  });

  test("Back returns to the previous page with its exact state", async ({ page }) => {
    await page.goto(COMPARE_URL);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare Cities");
    const before = page.url();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(settingsHeading(page)).toBeVisible();
    expect(new URL(page.url()).searchParams.get("dataset")).toBe("weather");

    await page.goBack();
    await expect(page).toHaveURL(before);
    const chart = page.getByTestId("climate-chart");
    await expect(chart.getByRole("button", { name: "Overlay", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
      { timeout: 30_000 },
    );
  });

  test("a dark theme survives a reload — set before any script of the app runs", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/settings");
    await page.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    // * no app bundle: only the inline head script can have set the class, so the first paint is dark
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.goto(CITY_URL, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  });

  test("system follows the device, and changes with it", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/settings");
    await expect(page.getByRole("button", { name: "System" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
  });

  test("animations off applies on a chart page", async ({ page }) => {
    await page.goto("/settings");
    await page.getByText("Animations", { exact: true }).click();

    await page.goto(CITY_URL);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
  });

  test("auto-apply off: a filter waits for Apply on a chart page", async ({ page }) => {
    await page.goto("/settings");
    await page.getByText("Auto-apply filters", { exact: true }).click();

    await page.goto(CITY_URL);
    const sidebar = page.locator("aside");
    await sidebar.getByRole("button", { name: "Weather", exact: true }).click();
    await page.waitForTimeout(1500);
    expect(new URL(page.url()).searchParams.get("dataset")).toBeNull();

    await sidebar.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/dataset=weather/);
  });
});

test.describe("Comparison bar style", () => {
  test("chips show a bar swatch only where the view draws each year's bars", async ({ page }) => {
    const chips = page.locator("[data-toolbar-chips]");
    const swatches = chips.locator("[data-series-hatch]");

    await page.goto("/settings");
    await barStyleGroup(page).getByRole("radio", { name: "Patterns" }).click();
    await page.goto(FIVE_YEARS_URL.replace("&chart=standard", "&chart=walter-lieth"));
    await expect(chips.getByRole("button")).toHaveCount(5, { timeout: 30_000 });
    await expect(swatches).toHaveCount(0);

    await page.getByTestId("climate-chart").getByRole("button", { name: "Standard chart" }).click();
    await expect(page).toHaveURL(/chart=standard/);
    await expect(swatches).toHaveCount(5);
    expect(
      new Set(
        await swatches.evaluateAll((icons) =>
          icons.map((icon) => icon.getAttribute("data-series-hatch")),
        ),
      ),
    ).toEqual(new Set(["solid", "diagonal", "dots", "horizontal", "cross"]));
  });

  test("plain by default; a pick changes Compare Periods' bars and survives a reload", async ({
    page,
  }) => {
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect.poll(async () => (await overlayBars(page)).count).toBeGreaterThan(0);
    expect(await overlayBars(page)).toMatchObject({ shaded: 0, hatches: 0 });

    await page.goto("/settings");
    const group = barStyleGroup(page);
    await expect(group.getByRole("radio", { name: "Uniform" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await group.getByRole("radio", { name: "Shades" }).click();
    await expect(group.getByRole("radio", { name: "Shades" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect
      .poll(async () => {
        const bars = await overlayBars(page);
        return bars.count > 0 && bars.shaded === bars.count && bars.hatches === 0;
      })
      .toBe(true);

    await page.reload();
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect
      .poll(async () => {
        const bars = await overlayBars(page);
        return bars.count > 0 && bars.shaded === bars.count;
      })
      .toBe(true);

    await page.goto("/settings");
    await barStyleGroup(page).getByRole("radio", { name: "Shades" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(barStyleGroup(page).getByRole("radio", { name: "Patterns" })).toBeFocused();
    await page.goto(FIVE_YEARS_URL);
    await expect(page.locator(".recharts-bar")).toHaveCount(5, { timeout: 30_000 });
    await expect.poll(async () => (await overlayBars(page)).hatches).toBeGreaterThan(0);
    expect((await overlayBars(page)).shaded).toBe(0);
  });
});

test.describe("Settings page on a phone", () => {
  test.use({ viewport: devices["Pixel 7"].viewport });

  test("the menu's Settings item opens it; no theme button in the top bar", async ({ page }) => {
    await page.goto(CITY_URL);
    await expect(page.getByRole("button", { name: "Toggle theme" })).toHaveCount(0);

    await page.getByRole("button", { name: "Toggle menu" }).click();
    await page.getByRole("link", { name: "Settings" }).click();

    await expect(settingsHeading(page)).toBeVisible();
    await expect(page.getByTestId("language-switcher")).toBeVisible();
  });
});

const SECTIONS = ["Language", "Appearance", "Charts and filters"];
const UNDESCRIBED_ROWS = ["App language", "Theme"];

const settingsRows = (page: Page) =>
  page.locator("main section").evaluateAll((sections) =>
    sections.map((section) =>
      [...(section.querySelector(":scope > div")?.children ?? [])].map((row) => {
        const controls = [...row.querySelectorAll("input, [role=group] button, [role=radio]")];
        const describedBy = controls.map(
          (control) => control.getAttribute("aria-describedby")?.split(" ")[0],
        );
        const description = describedBy[0] ? document.getElementById(describedBy[0]) : null;
        const style = getComputedStyle(row);
        return {
          label: row.querySelector("span")?.textContent,
          description: description && row.contains(description) ? description.textContent : null,
          isEveryControlDescribed: describedBy.every(
            (id) => id !== undefined && id === describedBy[0],
          ),
          height: row.getBoundingClientRect().height,
          line: `${style.backgroundImage} ${style.backgroundSize}`,
        };
      }),
    ),
  );

test.describe("Settings page layout", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("one card: three sections in order, each with an h2 heading", async ({ page }) => {
    await page.goto("/settings");
    const sections = page.locator("main section");
    await expect(sections).toHaveCount(3);
    await expect(sections.locator(":scope > h2")).toHaveText(SECTIONS);
    const parents = await sections.evaluateAll((elements) =>
      elements.map((section) => section.parentElement),
    );
    expect(new Set(parents).size).toBe(1);
    expect(
      await sections.first().evaluate((section) => {
        const style = getComputedStyle(section.parentElement ?? section);
        return [style.borderTopStyle, style.borderTopLeftRadius !== "0px"];
      }),
    ).toEqual(["solid", true]);
  });

  test("every row has its description, and its control is described by it", async ({ page }) => {
    await page.goto("/settings");
    const rows = (await settingsRows(page)).flat();
    expect(rows.filter(({ description }) => !description).map(({ label }) => label)).toEqual(
      UNDESCRIBED_ROWS,
    );
    expect(
      rows
        .filter(({ label }) => !UNDESCRIBED_ROWS.includes(label ?? ""))
        .filter(({ isEveryControlDescribed }) => !isEveryControlDescribed),
    ).toEqual([]);
  });

  test("the Text size description is the step's name, and follows it", async ({ page }) => {
    await page.goto("/settings");
    const slider = page.getByRole("slider", { name: "Text size" });
    const description = page.locator(`#${await slider.getAttribute("aria-describedby")}`);
    await expect(description).toHaveText("Default");
    await slider.press("End");
    await expect(description).toHaveText("Larger");
  });

  test("the Update highlight description says how to enable it once animations are off", async ({
    page,
  }) => {
    await page.goto("/settings");
    const glow = page.getByRole("button", { name: "Glow" });
    const description = page.locator(`#${await glow.getAttribute("aria-describedby")}`);
    await expect(description).toHaveText("How a card is marked when its data updates");
    await page.getByText("Animations", { exact: true }).click();
    await expect(description).toHaveText("Turn on animations to choose a highlight");
    await expect(glow).toBeDisabled();
  });

  test("one hairline between rows, none above the first; equal rows within a section", async ({
    page,
  }) => {
    await page.goto("/settings");
    const sections = await settingsRows(page);
    const lines = sections.flatMap((rows) => rows.slice(1).map(({ line }) => line));
    expect(new Set(lines).size).toBe(1);
    expect(lines[0]).toContain("linear-gradient");
    expect(sections.every(([first]) => first?.line.startsWith("none"))).toBe(true);
    const [, appearance = [], charts = []] = sections;
    for (const rows of [appearance, charts.slice(0, -1)]) {
      expect(new Set(rows.map(({ height }) => height)).size).toBe(1);
    }
  });

  test("flat: no shadow on the card, rows, slider thumb, switches or segments", async ({
    page,
  }) => {
    await page.goto("/settings");
    const shadows = await page.evaluate(() => {
      const card = document.querySelector("main section")?.parentElement;
      const rows = [...document.querySelectorAll("main section > div > div")];
      const switches = [...document.querySelectorAll("main label input[type=checkbox] + div")];
      const segments = [...document.querySelectorAll("main [role=group], main [role=group] *")];
      return [...(card ? [card] : []), ...rows, ...switches, ...segments].flatMap((element) =>
        [null, "::before", "::after"]
          .map((pseudo) => getComputedStyle(element, pseudo).boxShadow)
          .filter((shadow) => shadow !== "none")
          .map((shadow) => `${element.tagName} ${shadow}`),
      );
    });
    expect(shadows).toEqual([]);
    // * a thumb's computed style can't be read: its rules must set no shadow
    const sliderClass = await page.getByRole("slider").getAttribute("class");
    expect(sliderClass).not.toMatch(/thumb\]:shadow/);
  });
});

for (const width of [360, 1440]) {
  test.describe(`Settings page at ${width}px, Larger text`, () => {
    test.use({ viewport: { width, height: 900 }, hasTouch: width < 1024, isMobile: width < 1024 });

    test("no sideways scroll; every row inside its section, its controls inside the row", async ({
      page,
    }) => {
      await page.addInitScript(() =>
        localStorage.setItem(
          "climatica:settings",
          JSON.stringify({ state: { textSize: "larger" }, version: 2 }),
        ),
      );
      await page.goto("/settings");
      const layout = await page.evaluate(() => {
        const box = (element: Element) => element.getBoundingClientRect();
        const groups = [...document.querySelectorAll("main section > div")];
        const outside = groups.flatMap((group) =>
          [...group.children].flatMap((row) => {
            const [g, r] = [box(group), box(row)];
            const controls = [...row.querySelectorAll("button, input, label, span")].filter(
              (control) => {
                const c = box(control);
                return c.width > 0 && (c.left < r.left - 0.5 || c.right > r.right + 0.5);
              },
            );
            return [
              ...(r.left < g.left - 0.5 || r.right > g.right + 0.5 ? ["row"] : []),
              ...controls.map((control) => control.textContent ?? control.tagName),
            ];
          }),
        );
        const cards = [...document.querySelectorAll("[role=radio]")].map((card) => box(card).top);
        const language = document.querySelector("[data-testid=language-switcher]");
        return {
          scrollWidth: document.documentElement.scrollWidth,
          outside,
          rowHeights: groups.flatMap((group) => [...group.children].map((row) => box(row).height)),
          cardTops: cards,
          languageRow: [
            language,
            language?.closest("section > div > div")?.querySelector("span"),
          ].map((element) => (element ? box(element) : null)),
        };
      });
      expect(layout.scrollWidth).toBeLessThanOrEqual(width);
      expect(layout.outside).toEqual([]);
      expect(Math.min(...layout.rowHeights)).toBeGreaterThanOrEqual(44);
      expect(new Set(layout.cardTops.map(Math.round)).size).toBe(1);
      const [trigger, label] = layout.languageRow;
      expect(trigger?.left).toBeGreaterThan(label?.right ?? Infinity);
    });
  });
}

const rowLayout = (page: Page, name: string) =>
  page.getByRole("group", { name, exact: true }).evaluate((control) => {
    const box = (element: Element | null | undefined) => {
      const { left, right, top, bottom, width } = element?.getBoundingClientRect() ?? new DOMRect();
      return { left, right, top, bottom, width };
    };
    const content = control.closest("section > div > div")?.firstElementChild;
    const labels = [...control.querySelectorAll("button > span")];
    return {
      label: box(content?.querySelector("span")),
      control: box(control),
      row: box(content),
      labelsShown: labels.every(
        (label) => label.checkVisibility() && label.getBoundingClientRect().width > 1,
      ),
      texts: labels.map((label) => label.textContent),
      iconsShown: [...control.querySelectorAll("button")].every((button) => {
        const icon = button.querySelector("svg");
        return icon?.checkVisibility() === true && icon.getBoundingClientRect().width > 1;
      }),
    };
  });

const barStyleLook = (page: Page) =>
  page.locator("[role=radio]").evaluateAll((cards) =>
    cards.map((card) => ({
      outline: getComputedStyle(card.firstElementChild ?? card).outlineStyle,
      hasIndicator: card.querySelector("[data-selection-indicator]")?.checkVisibility() === true,
    })),
  );

test.describe("Settings page on a 360px phone", () => {
  test.use({ viewport: { width: 360, height: 900 }, hasTouch: true, isMobile: true });

  for (const [name, texts] of [
    ["Theme", ["Light", "Dark", "System"]],
    ["Update highlight", ["Glow", "Border"]],
  ] as const) {
    test(`${name}: every label shows; the control sits under its label at full width`, async ({
      page,
    }) => {
      await page.goto("/settings");
      const {
        label,
        control,
        row,
        labelsShown,
        iconsShown,
        texts: shown,
      } = await rowLayout(page, name);
      expect(labelsShown).toBe(true);
      expect(iconsShown).toBe(true);
      expect(shown).toEqual(texts);
      expect(control.top).toBeGreaterThanOrEqual(label.bottom);
      expect(control.width).toBeCloseTo(row.width, 0);
    });
  }

  test("the card keeps its frame", async ({ page }) => {
    await page.goto("/settings");
    expect(
      await page
        .locator("main section")
        .first()
        .evaluate((section) => getComputedStyle(section.parentElement ?? section).borderTopWidth),
    ).toBe("1px");
  });

  test("descriptions: in the left column beside a switch, across the row under a wide control, close under their label", async ({
    page,
  }) => {
    await page.goto("/settings");
    const rows = await page.locator("main section > div > div").evaluateAll((elements) =>
      elements.flatMap((row) => {
        const box = (element: Element | null | undefined) =>
          element?.getBoundingClientRect() ?? new DOMRect();
        const content = row.firstElementChild;
        const isSwitch = content?.querySelector("input[type=checkbox]") !== null;
        const description = isSwitch
          ? content?.querySelector("label > span > span:last-child")
          : content?.querySelector("[id$=-description]");
        if (!description) return [];
        const label = isSwitch
          ? content?.querySelector("label > span > span:first-child")
          : content?.querySelector("span");
        const block = isSwitch ? content?.querySelector("label > span") : null;
        const control = isSwitch
          ? content?.querySelector("input + div")
          : content?.lastElementChild?.firstElementChild;
        const centre = (r: DOMRect) => r.top + r.height / 2;
        return [
          {
            isSwitch,
            label: label?.textContent,
            gap:
              box(description).top -
              Math.max(
                box(label).bottom,
                box(control).top >= box(label).bottom ? box(control).bottom : 0,
              ),
            descriptionWidth: box(description).width,
            rowWidth: box(content).width,
            descriptionRight: box(description).right,
            controlLeft: box(control).left,
            centreOffset: block ? Math.abs(centre(box(block)) - centre(box(control))) : 0,
          },
        ];
      }),
    );
    const switches = rows.filter(({ isSwitch }) => isSwitch);
    const wide = rows.filter(({ label }) => label === "Text size" || label === "Update highlight");
    expect(switches).toHaveLength(5);
    expect(wide).toHaveLength(2);
    for (const row of switches) {
      expect(row.descriptionRight).toBeLessThanOrEqual(row.controlLeft);
      expect(row.centreOffset).toBeLessThanOrEqual(1);
    }
    for (const row of wide) expect(row.descriptionWidth).toBeCloseTo(row.rowWidth, 0);
    for (const row of rows) expect(row.gap).toBeLessThanOrEqual(8);
  });

  test("hit areas: at least 44px tall, never overlapping another row's", async ({ page }) => {
    await page.goto("/settings");
    const targets = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("main section > div > div")];
      return rows.flatMap((row, rowIndex) =>
        [...row.querySelectorAll("button, input[type=range], label, [role=radio]")]
          .filter((element) =>
            element.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
          )
          .map((element) => {
            const r = element.getBoundingClientRect();
            const before = getComputedStyle(element, "::before");
            const isTarget = before.content !== "none" && before.position === "absolute";
            const reach = (side: string) =>
              isTarget ? Math.max(0, -parseFloat(before.getPropertyValue(side) || "0")) : 0;
            return {
              rowIndex,
              name: element.textContent?.trim().slice(0, 20),
              top: r.top - reach("top"),
              bottom: r.bottom + reach("bottom"),
              left: r.left - reach("left"),
              right: r.right + reach("right"),
            };
          }),
      );
    });
    const short = targets.filter(({ top, bottom }) => bottom - top < 44 - 0.5);
    expect(short.map(({ name, top, bottom }) => `${name} ${bottom - top}`)).toEqual([]);
    const overlaps = targets.flatMap((a) =>
      targets
        .filter(
          (b) =>
            b.rowIndex > a.rowIndex &&
            a.left < b.right &&
            b.left < a.right &&
            a.top < b.bottom - 0.5 &&
            b.top < a.bottom - 0.5,
        )
        .map((b) => `${a.name} / ${b.name}`),
    );
    expect(overlaps).toEqual([]);
  });

  test("bar style: radio indicators, no outline ring", async ({ page }) => {
    await page.goto("/settings");
    const cards = await barStyleLook(page);
    expect(cards).toHaveLength(3);
    expect(cards.every(({ outline, hasIndicator }) => outline === "none" && hasIndicator)).toBe(
      true,
    );
    expect(
      await barStyleGroup(page)
        .getByRole("radio", { checked: true })
        .evaluate((card) => card.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
  });
});

test.describe("Settings segmented rows on a desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Theme and Update highlight sit beside their labels", async ({ page }) => {
    await page.goto("/settings");
    for (const name of ["Theme", "Update highlight"]) {
      const { label, control, labelsShown, iconsShown } = await rowLayout(page, name);
      expect(labelsShown).toBe(true);
      expect(iconsShown).toBe(true);
      expect(control.left).toBeGreaterThan(label.right);
      expect(control.top).toBeLessThan(label.bottom);
    }
  });

  test("bar style: the selected thumbnail ringed, no radio indicators", async ({ page }) => {
    await page.goto("/settings");
    expect((await barStyleLook(page)).map(({ outline }) => outline)).toEqual([
      "solid",
      "none",
      "none",
    ]);
    expect((await barStyleLook(page)).some(({ hasIndicator }) => hasIndicator)).toBe(false);
  });

  for (const textSize of ["default", "larger"]) {
    test(`segment icons are 1.15× their label's text (${textSize})`, async ({ page }) => {
      await page.addInitScript(
        (size) =>
          localStorage.setItem(
            "climatica:settings",
            JSON.stringify({ state: { textSize: size }, version: 2 }),
          ),
        textSize,
      );
      await page.goto("/settings");
      const ratios = await page
        .getByRole("group", { name: "Theme", exact: true })
        .locator("button")
        .evaluateAll((buttons) =>
          buttons.map((button) => {
            const icon = button.querySelector("svg")?.getBoundingClientRect();
            const text = button.querySelector("span")?.getBoundingClientRect();
            const centre = (box?: DOMRect) => (box ? box.top + box.height / 2 : 0);
            return {
              ratio: (icon?.width ?? 0) / parseFloat(getComputedStyle(button).fontSize),
              offset: Math.abs(centre(icon) - centre(text)),
            };
          }),
        );
      expect(ratios).toHaveLength(3);
      for (const { ratio, offset } of ratios) {
        expect(ratio).toBeCloseTo(1.15, 2);
        expect(offset).toBeLessThanOrEqual(1);
      }
    });
  }
});

const themeLayout = (page: Page) =>
  page.getByRole("group", { name: /^(Theme|Θέμα|Тема)$/ }).evaluate((control) => {
    const buttons = [...control.querySelectorAll("button")];
    const box = control.getBoundingClientRect();
    return {
      layout: control.getAttribute("data-layout"),
      tops: buttons.map((button) => Math.round(button.getBoundingClientRect().top)),
      singleLine: buttons.map((button) => {
        const range = document.createRange();
        range.selectNodeContents(button.querySelector("span") ?? button);
        return range.getClientRects().length === 1;
      }),
      widths: buttons.map((button) => button.getBoundingClientRect().width),
      controlWidth: box.width,
      heights: buttons.map((button) => button.getBoundingClientRect().height),
    };
  });

for (const locale of ["el", "uk"]) {
  test.describe(`Settings Theme at 360px, Larger, ${locale}`, () => {
    test.use({ viewport: { width: 360, height: 900 }, hasTouch: true, isMobile: true });

    test("a vertical list: one option per line, each label on one line", async ({
      page,
      context,
      baseURL,
    }) => {
      await context.addCookies([{ name: "NEXT_LOCALE", value: locale, url: baseURL ?? "" }]);
      await page.addInitScript(() =>
        localStorage.setItem(
          "climatica:settings",
          JSON.stringify({ state: { textSize: "larger" }, version: 2 }),
        ),
      );
      await page.goto("/settings");
      const theme = await themeLayout(page);
      expect(theme.layout).toBe("list");
      expect(new Set(theme.tops).size).toBe(3);
      expect(theme.singleLine).toEqual([true, true, true]);
      for (const width of theme.widths) expect(width).toBeGreaterThan(theme.controlWidth - 8);
      for (const height of theme.heights) expect(height).toBeGreaterThanOrEqual(44);
    });
  });
}

test.describe("Settings Theme at 360px, Default, en", () => {
  test.use({ viewport: { width: 360, height: 900 }, hasTouch: true, isMobile: true });

  test("inline: the options side by side, each label on one line", async ({ page }) => {
    await page.goto("/settings");
    const theme = await themeLayout(page);
    expect(theme.layout).toBe("inline");
    expect(new Set(theme.tops).size).toBe(1);
    expect(theme.singleLine).toEqual([true, true, true]);
  });
});
