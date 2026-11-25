import { FIRST_RELEASE_YEAR, PROFILE_URLS, PROJECT_INFO } from "@/constants/project.constant";
import { formatCopyrightYears } from "@/utils/info.util";
import { devices, expect, test, type Locator, type Page } from "@playwright/test";

const LANGUAGE_COOKIE = "NEXT_LOCALE";
const INFO_ROUTES = ["/about", "/about/guide", "/about/data"];
const COPYRIGHT_YEARS = formatCopyrightYears({
  firstYear: FIRST_RELEASE_YEAR,
  currentYear: new Date().getFullYear(),
});
const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";

const infoNav = (page: Page) => page.getByRole("navigation", { name: "Info pages" });
// * a section of the current page, nested in the Info navigation (only visible ones count)
const sectionLink = (page: Page, name: string) =>
  infoNav(page).getByRole("link", { name, exact: true });
// * the Contents bar's breadcrumb, by its accessible label
const breadcrumb = (page: Page) => page.getByRole("navigation", { name: "You are here" });
const TEAM_CARDS = [
  {
    name: "Andrii Kononenko",
    href: "https://github.com/wastxrq",
    role: "Design and development",
    affiliation: "GSIC-EMIC, Universidad de Valladolid",
    initials: "AK",
  },
  {
    name: "Guillermo Vega-Gorgojo",
    href: "https://www.gsic.uva.es/members/guiveg",
    role: "Supervision; author of SCRAPI",
    affiliation: "GSIC-EMIC, Universidad de Valladolid",
    initials: "GV",
  },
  {
    name: "Eduardo Gómez-Sánchez",
    href: "https://www.gsic.uva.es/members/edugom",
    role: "Supervision",
    affiliation: "GSIC-EMIC, Universidad de Valladolid",
    initials: "EG",
  },
  {
    name: "Pablo García Zarza",
    href: "https://www.gsic.uva.es/members/pablogz",
    role: "Advice on design and development",
    affiliation: "GSIC-EMIC, Universidad de Valladolid",
    initials: "PG",
  },
  {
    name: "Felipe Bravo",
    href: "https://iufor.uva.es/investigacion/equipo-investigacion/felipe-bravo-oviedo/",
    role: "Forest management expertise",
    affiliation: "iuFOR, Universidad de Valladolid",
    initials: "FB",
  },
];
const contentsButton = (page: Page) => page.getByRole("button", { name: "Contents" });
const topbarAbout = (page: Page) =>
  page.getByRole("banner").getByRole("link", { name: "About", exact: true });

test.describe("Info pages", () => {
  test("the navbar's About opens the Info pages, and the sidebar moves between them", async ({
    page,
  }) => {
    await page.goto(CITY_URL);
    await topbarAbout(page).click();
    await expect(page).toHaveURL(/\/about(\?|$)/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About Climatica");
    await expect(page).toHaveTitle("About | Climatica");

    await infoNav(page).getByRole("link", { name: "User guide" }).click();
    await expect(page).toHaveURL(/\/about\/guide/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("User guide");

    await infoNav(page).getByRole("link", { name: "Data & methods" }).click();
    await expect(page).toHaveURL(/\/about\/data/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Data & methods");
  });

  test("marks the current page in the sidebar and the navbar", async ({ page }) => {
    await page.goto("/about/guide");
    const current = infoNav(page).locator("[aria-current=page]");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText("User guide");
    await expect(topbarAbout(page)).toHaveAttribute("aria-current", "page");
    // * the guide's own sections open under it; another page's folded shut and inert (rendered,
    // * so a page switch can fold them); no headings in the nav
    await expect(sectionLink(page, "Questions")).toBeVisible();
    await expect(sectionLink(page, "Questions").locator("xpath=ancestor::*[@inert]")).toHaveCount(
      0,
    );
    await expect(
      sectionLink(page, "Spatial resolutions").locator("xpath=ancestor::*[@inert]"),
    ).toHaveCount(1);
    await expect(infoNav(page).getByRole("heading")).toHaveCount(0);
    // * the first section is current before any scrolling
    await expect(sectionLink(page, "Find a place")).toHaveAttribute("aria-current", "location");
  });

  test("a section link scrolls to its section, marks it at once and sets the hash", async ({
    page,
  }) => {
    await page.goto("/about/data");
    await sectionLink(page, "References").click();
    await expect(sectionLink(page, "References")).toHaveAttribute("aria-current", "location");
    await expect(page).toHaveURL(/#references$/);
    await expect(page.getByRole("heading", { name: "References", level: 2 })).toBeInViewport();
    await expect(infoNav(page).locator("[aria-current=location]:visible")).toHaveCount(1);
  });

  test("scrolling marks the section in view", async ({ page }) => {
    await page.goto("/about/data");
    await page
      .getByRole("heading", { name: "Climate indicators", level: 2 })
      .evaluate((heading) => heading.closest("section")?.scrollIntoView());
    await expect(sectionLink(page, "Climate indicators")).toHaveAttribute(
      "aria-current",
      "location",
    );
    await expect(sectionLink(page, "What a value describes")).not.toHaveAttribute(
      "aria-current",
      "location",
    );
    // * back up: the first section again
    await page.locator("main").evaluate((main) => main.scrollTo({ top: 0 }));
    await expect(sectionLink(page, "What a value describes")).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("the resolution selector links to the resolutions section", async ({ page }) => {
    await page.goto(CITY_URL);
    await page.getByRole("link", { name: "What do resolutions mean?" }).click();
    await expect(page).toHaveURL(/\/about\/data#resolutions$/);
    await expect(page.getByRole("heading", { name: "Spatial resolutions" })).toBeInViewport();
    await expect(page.getByRole("table")).toContainText("Only the 1970–2000 climate normal");
  });

  test("follows the chosen language", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: LANGUAGE_COOKIE, value: "es", url: baseURL ?? "" }]);
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Acerca de Climatica");
    await expect(page).toHaveTitle("Acerca de | Climatica");
    await expect(
      page.getByRole("navigation", { name: "Páginas de información" }).getByRole("link", {
        name: "Datos y métodos",
      }),
    ).toBeVisible();
  });

  test("copying the citation says so", async ({ page, context }) => {
    test.skip(PROJECT_INFO.citation === "", "no citation configured yet: the section is hidden");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/about#cite");
    await page.getByRole("button", { name: "Copy citation" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Copied" })).toHaveText(
      "Copied to the clipboard",
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(PROJECT_INFO.citation);
  });

  test("every Info page ends with the footer; the app's pages have none", async ({ page }) => {
    for (const route of INFO_ROUTES) {
      await page.goto(route);
      const footer = page.getByRole("contentinfo");
      await expect(footer).toHaveCount(1);
      await expect(footer).toHaveText(
        `© ${COPYRIGHT_YEARS} GSIC-EMIC research group • Universidad de Valladolid`,
      );
    }
    for (const route of [CITY_URL, "/compare-cities", "/heat-map", "/settings"]) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
    }
  });

  test("the footer's proper names stay as they are in another language", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: LANGUAGE_COOKIE, value: "es", url: baseURL ?? "" }]);
    await page.goto("/about/guide");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveText(
      `© ${COPYRIGHT_YEARS} Grupo de investigación GSIC-EMIC • Universidad de Valladolid`,
    );
  });

  test("every team card: a profile link, a role and an affiliation", async ({ page }) => {
    await page.goto("/about#team");
    for (const { name, href, role, affiliation, initials } of TEAM_CARDS) {
      const profile = page
        .locator("#team")
        .getByRole("link", { name: `${name} (opens in a new tab)` });
      await expect(profile).toHaveAttribute("href", href);
      await expect(profile).toHaveAttribute("target", "_blank");
      await expect(profile).toHaveAttribute("rel", "noopener noreferrer");
      const card = page.locator("#team li").filter({ hasText: name });
      await expect(card).toContainText(role);
      await expect(card).toContainText(affiliation);
      await expect(card).toContainText(initials);
    }
  });

  test("team cards in a row are as tall as each other, avatars level with the name", async ({
    page,
  }) => {
    await page.goto("/about#team");
    const cards = await page.locator("#team li").evaluateAll((items) =>
      items.map((item) => {
        const card = item.firstElementChild?.getBoundingClientRect();
        const avatar = item.querySelector("[aria-hidden=true]")?.getBoundingClientRect();
        const link = item.querySelector("a");
        const name = link?.getBoundingClientRect();
        const lineHeight = link ? parseFloat(getComputedStyle(link).lineHeight) : 0;
        return {
          top: Math.round(card?.top ?? 0),
          height: Math.round(card?.height ?? 0),
          avatarMiddle: ((avatar?.top ?? 0) + (avatar?.bottom ?? 0)) / 2,
          nameLineMiddle: (name?.top ?? 0) + lineHeight / 2,
        };
      }),
    );
    expect(cards).toHaveLength(TEAM_CARDS.length);
    const rows = Map.groupBy(cards, ({ top }) => top);
    expect([...rows.values()].some((row) => row.length > 1)).toBe(true);
    for (const row of rows.values()) {
      expect(new Set(row.map(({ height }) => height)).size).toBe(1);
    }
    for (const { avatarMiddle, nameLineMiddle } of cards) {
      // * the avatar centred on the name's first line, not down the card
      expect(Math.abs(avatarMiddle - nameLineMiddle)).toBeLessThanOrEqual(1);
    }
  });

  test("team names take the card titles' size and weight", async ({ page }) => {
    await page.goto("/about");
    const style = (locator: Locator) =>
      locator.evaluate((element) => {
        const computed = getComputedStyle(element);
        return { size: computed.fontSize, weight: computed.fontWeight };
      });
    const title = await style(page.locator("#how-it-works h3").first());
    for (const name of await page.locator("#team li a").all()) {
      expect(await style(name)).toEqual(title);
    }
  });

  test("the SCRAPI card's author links to his profile, in a new tab", async ({ page }) => {
    await page.goto("/about#data-sources");
    const author = page
      .locator("#data-sources")
      .getByRole("link", { name: `${PROJECT_INFO.scrapiAuthor} (opens in a new tab)` });
    await expect(author).toHaveAttribute("href", PROFILE_URLS.VEGA_GORGOJO);
    await expect(author).toHaveAttribute("target", "_blank");
  });

  test("What a value describes: Bolzano's cells, their numbers from the example", async ({
    page,
  }) => {
    await page.goto("/about/data#cell-values");
    const section = page.locator("#cell-values");
    await expect(section).toContainText(
      "Its value is the average of all of them, so it may not match any one spot exactly.",
    );
    await expect(section).toContainText("so the cell's mean elevation is 638 m");
    await expect(section).toContainText("252 m and 11.7 °C, much closer to the town itself.");
  });

  test("the 30 sec answer says how SCRAPI gets the other normals", async ({ page }) => {
    await page.goto("/about/guide#questions");
    const answer = page.locator("#questions details").filter({ hasText: "Why isn't 30 sec" });
    await answer.locator("summary").click();
    await expect(answer).toContainText(
      "SCRAPI computes the other normals from WorldClim's yearly weather data, which goes down to 2.5 min, so those periods do too.",
    );
  });

  test("references: DOIs for Fick and Harris, Google Scholar for Walter–Lieth and de Martonne", async ({
    page,
  }) => {
    await page.goto("/about/data#references");
    const links = page.locator("#references").getByRole("link");
    await expect(links).toHaveText([
      "doi:10.1002/joc.5086 (opens in a new tab)",
      "doi:10.1038/s41597-020-0453-3 (opens in a new tab)",
      "Google Scholar (opens in a new tab)",
      "Google Scholar (opens in a new tab)",
    ]);
    const scholar = page.locator("#references").getByRole("link", { name: /Google Scholar/ });
    await expect(scholar.first()).toHaveAttribute(
      "href",
      "https://scholar.google.com/scholar?q=%22Klimadiagramm-Weltatlas%22",
    );
    await expect(scholar.first()).toHaveAttribute("target", "_blank");
  });

  test("the User guide's Settings link opens the Settings page", async ({ page }) => {
    await page.goto("/about/guide#filters");
    await page.locator("#filters").getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings(\?|$)/);
  });

  test("only the About page's opening paragraph is larger; every section paragraph is one size", async ({
    page,
  }) => {
    for (const route of INFO_ROUTES) {
      await page.goto(route);
      const sizes = await fontSizeOf(page.locator("main section > p"));
      expect(sizes.length).toBeGreaterThan(0);
      expect(new Set(sizes).size).toBe(1);
      if (route === "/about") {
        const [lead] = await fontSizeOf(
          page.locator("main p", { hasText: "Climatica lets you explore" }),
        );
        expect(lead).toBeGreaterThan(sizes[0] ?? 0);
      }
    }
  });

  test("the footer is 16px from lg", async ({ page }) => {
    await page.goto("/about/guide");
    const size = await page
      .getByRole("contentinfo")
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(size).toBe(16);
  });

  test("hides the citation until one is configured", async ({ page }) => {
    test.skip(PROJECT_INFO.citation !== "", "a citation is configured");
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "How to cite" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "How to cite" })).toHaveCount(0);
  });
});

// * How it works: its intro paragraph's, heading's and card grid's boxes, the Info column's
// * width, the reading measure (measured in the paragraph's own font, as its max width is), and
// * whether anything scrolls sideways
const measureInfoLayout = (page: Page) =>
  page.evaluate(() => {
    const box = (selector: string) => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return { left: rect?.left ?? 0, width: rect?.width ?? 0 };
    };
    const paragraph = document.querySelector("#how-it-works > p");
    const probe = document.createElement("div");
    probe.style.width = "var(--reading-measure)";
    paragraph?.append(probe);
    const measure = probe.getBoundingClientRect().width;
    probe.remove();
    const scrollers = [document.documentElement, document.querySelector("main")];
    return {
      paragraph: box("#how-it-works > p"),
      heading: box("#how-it-works > h2"),
      grid: box("#how-it-works > ol"),
      column: document.querySelector("#how-it-works")?.parentElement?.getBoundingClientRect().width,
      measure,
      hasSideScroll: scrollers.some(
        (element) => element !== null && element.scrollWidth > element.clientWidth,
      ),
    };
  });

const panelBox = async (panel: Locator) => {
  const box = await panel.boundingBox();
  return { x: box?.x, width: box?.width };
};

test.describe("Info pages' layout", () => {
  test("at 1440px the navigation sits in the filters' left panel", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(CITY_URL);
    const filters = await panelBox(page.getByRole("complementary", { name: "Filters" }));
    await page.goto("/about");
    const info = await panelBox(page.getByRole("complementary").filter({ has: infoNav(page) }));
    expect(info).toEqual(filters);
  });

  test("at 1440px the blocks share one left edge; prose keeps the reading measure", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    const layout = await measureInfoLayout(page);
    expect(layout.measure).toBeGreaterThan(0);
    expect(layout.heading.left).toBeCloseTo(layout.paragraph.left, 0);
    expect(layout.grid.left).toBeCloseTo(layout.paragraph.left, 0);
    expect(layout.paragraph.width).toBeLessThanOrEqual(layout.measure + 1);
    expect(layout.grid.width).toBeGreaterThan(layout.paragraph.width);
    expect(layout.grid.width).toBeCloseTo(layout.column ?? 0, 0);
    expect(layout.hasSideScroll).toBe(false);
  });

  test("a link to a section lands on it without shifting the panel", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const [url, name] of [
      ["/about#privacy", "Privacy"],
      ["/about/data#references", "References"],
    ] as const) {
      await page.goto(url);
      const heading = page.getByRole("heading", { name, level: 2 });
      await expect(heading).toBeInViewport();
      // * after the charts near it have mounted
      await page.waitForTimeout(SETTLE_MS);
      await expect(heading).toBeInViewport();
      const panel = page.getByRole("complementary").filter({ has: infoNav(page) });
      const main = await page.locator("main").boundingBox();
      expect((await panel.boundingBox())?.y).toBe(main?.y);
    }
  });

  test("at 1024px the paragraph and the card grid fit without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/about");
    const layout = await measureInfoLayout(page);
    expect(layout.paragraph.width).toBeLessThanOrEqual(layout.measure + 1);
    expect(layout.grid.width).toBeLessThanOrEqual((layout.column ?? 0) + 1);
    expect(layout.hasSideScroll).toBe(false);
  });
});

test.describe("Info pages on a phone", () => {
  // * the phone's screen and touch, not its browser type: that would need a worker of its own
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices["Pixel 7"];
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test("the resolution sheet's link closes the sheet and leads to the resolutions", async ({
    page,
  }) => {
    await page.goto(CITY_URL);
    // * hydrated: the chip is in the server's HTML, and a tap before hydration does nothing; the
    // * chart turns not busy only on the client, once its data are in
    await expect(page.getByTestId("climate-chart")).toHaveAttribute("aria-busy", "false", {
      timeout: 30_000,
    });
    await page.getByRole("button", { name: "Resolution: 30 sec" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "What do resolutions mean?" }).click();
    await expect(page).toHaveURL(/\/about\/data#resolutions$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Spatial resolutions" })).toBeInViewport();
  });

  test("the footer is centred, in the touch scale", async ({ page }) => {
    await page.goto("/about/data");
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    const style = await footer.evaluate((element) => {
      const computed = getComputedStyle(element);
      return { align: computed.textAlign, size: parseFloat(computed.fontSize) };
    });
    expect(style.align).toBe("center");
    expect(style.size).toBeGreaterThanOrEqual(15);
  });

  test("at 360px the footer is two centred lines with no separator", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 760 });
    await page.goto("/about/guide");
    const footer = page.getByRole("contentinfo");
    await footer.scrollIntoViewIfNeeded();
    const lines = footer.locator("p > span:not([aria-hidden])");
    await expect(lines).toHaveText([
      `© ${COPYRIGHT_YEARS} GSIC-EMIC research group`,
      "Universidad de Valladolid",
    ]);
    const [first, second] = await lines.evaluateAll((spans) =>
      spans.map((span) => span.getBoundingClientRect().top),
    );
    expect(second ?? 0).toBeGreaterThan(first ?? 0);
    await expect(footer.locator("[aria-hidden=true]")).toBeHidden();
    const style = await footer.evaluate((element) => ({
      align: getComputedStyle(element).textAlign,
      size: parseFloat(getComputedStyle(element).fontSize),
    }));
    expect(style.align).toBe("center");
    expect(style.size).toBeGreaterThanOrEqual(15);
  });

  test("at 360px no team card overflows; the university stays on one line", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 760 });
    await page.goto("/about#team");
    const cards = page.locator("#team li > *");
    await expect(cards).toHaveCount(5);
    const overflow = await cards.evaluateAll((elements) =>
      elements.map((card) => card.scrollWidth - card.clientWidth),
    );
    expect(Math.max(...overflow)).toBeLessThanOrEqual(0);
    const university = page.locator("#team span", { hasText: /^Universidad de Valladolid$/ });
    for (const part of await university.all()) {
      const lineCount = await part.evaluate(
        (element) =>
          Math.round(element.getBoundingClientRect().height) /
          parseFloat(getComputedStyle(element).lineHeight),
      );
      expect(lineCount).toBeLessThanOrEqual(1);
    }
  });

  test("one Contents bar under the top bar, no sidebar", async ({ page }) => {
    await page.goto("/about/guide");
    const bar = contentsButton(page);
    await expect(bar).toBeVisible();
    await expect(infoNav(page)).toHaveCount(0);
    // * page, then the section in view, from the same scroll spy as the sidebar
    await expect(breadcrumb(page)).toHaveText("User guideFind a place");
    await expect(breadcrumb(page).locator("[aria-current=page]")).toHaveText("User guide");
    const separator = breadcrumb(page).locator("svg");
    const box = await separator.boundingBox();
    expect(Math.max(box?.width ?? 0, box?.height ?? 0)).toBeGreaterThanOrEqual(14);
    const barBox = await bar.boundingBox();
    const titleBox = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(barBox && titleBox && barBox.y < titleBox.y).toBe(true);
  });

  test("the bar stays pinned and follows the section in view", async ({ page }) => {
    await page.goto("/about/data");
    await page
      .getByRole("heading", { name: "Climate indicators", level: 2 })
      .evaluate((heading) => heading.closest("section")?.scrollIntoView());
    await expect(contentsButton(page)).toBeInViewport();
    await expect(breadcrumb(page)).toHaveText("Data & methodsClimate indicators");
  });

  test("Contents opens the tree in a sheet; a section closes it and scrolls there", async ({
    page,
  }) => {
    await page.goto("/about/guide");
    await contentsButton(page).click();
    const sheet = page.getByRole("dialog", { name: "Contents" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: "User guide" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const section = sheet.getByRole("link", { name: "Questions" });
    expect((await section.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    expect(
      (await sheet.getByRole("link", { name: "Data & methods" }).boundingBox())?.height,
    ).toBeGreaterThanOrEqual(48);

    await section.click();
    await expect(sheet).toHaveCount(0);
    await expect(page).toHaveURL(/\/about\/guide#questions$/);
    await expect(page.getByRole("heading", { name: "Questions", level: 2 })).toBeInViewport();
    await expect(breadcrumb(page)).toHaveText("User guideQuestions");
  });

  test("a page in the sheet closes it and opens the page; Back returns", async ({ page }) => {
    await page.goto("/about/guide");
    await contentsButton(page).click();
    await page.getByRole("dialog").getByRole("link", { name: "Data & methods" }).click();
    await expect(page).toHaveURL(/\/about\/data/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Data & methods");
    await page.goBack();
    await expect(page).toHaveURL(/\/about\/guide/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

const scrollMainToEnd = (page: Page) =>
  page
    .locator("main")
    .evaluate((main) => main.scrollTo({ top: main.scrollHeight, behavior: "instant" }));
// * longer than a smooth scroll to a section takes, so the hold on a clicked one is tested
const SETTLE_MS = 1500;
const fontSizeOf = (locator: Locator) =>
  locator.evaluateAll((elements) =>
    elements.map((element) => parseFloat(getComputedStyle(element).fontSize)),
  );

test.describe("Info pages' rhythm and scroll spy", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("at the end of the page the last section is current", async ({ page }) => {
    await page.goto("/about");
    await scrollMainToEnd(page);
    await expect(sectionLink(page, "Privacy")).toHaveAttribute("aria-current", "location");
  });

  test("a clicked section stays current until the user scrolls", async ({ page }) => {
    await page.goto("/about");
    for (const name of ["Privacy", "Source code and versions"]) {
      await sectionLink(page, name).click();
      await expect(sectionLink(page, name)).toHaveAttribute("aria-current", "location");
      await page.waitForTimeout(SETTLE_MS);
      await expect(sectionLink(page, name)).toHaveAttribute("aria-current", "location");
    }
    const main = await page.locator("main").boundingBox();
    await page.mouse.move((main?.x ?? 0) + 200, (main?.y ?? 0) + 200);
    await page.mouse.wheel(0, -100_000);
    await expect(sectionLink(page, "How it works")).toHaveAttribute("aria-current", "location");
  });

  test("sections are about 5rem apart", async ({ page }) => {
    await page.goto("/about");
    const gap = await page.evaluate(() => {
      const first = document.getElementById("how-it-works")?.getBoundingClientRect();
      const second = document.getElementById("data-sources")?.getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return ((second?.top ?? 0) - (first?.bottom ?? 0)) / rem;
    });
    expect(gap).toBeCloseTo(5, 1);
  });

  test("card links are at least 16px, the tech pills at least 14px", async ({ page }) => {
    await page.goto("/about");
    // * the card links on their own line; an inline link (a name in a sentence) takes its text's size
    const links = await fontSizeOf(page.locator("#data-sources a:not(p a)"));
    expect(links.length).toBeGreaterThan(0);
    for (const size of links) expect(size).toBeGreaterThanOrEqual(16);
    const pills = await fontSizeOf(page.locator("#source-code [data-badge-size]"));
    expect(pills.length).toBeGreaterThan(0);
    for (const size of pills) expect(size).toBeGreaterThanOrEqual(14);
  });

  test("each question is at least as large as its answer", async ({ page }) => {
    await page.goto("/about/guide");
    const sizes = await page.locator("#questions details").evaluateAll((items) =>
      items.map((item) => ({
        question: parseFloat(getComputedStyle(item.querySelector("summary")!).fontSize),
        answer: parseFloat(getComputedStyle(item.querySelector("p")!).fontSize),
      })),
    );
    expect(sizes.length).toBeGreaterThan(0);
    for (const { question, answer } of sizes) expect(question).toBeGreaterThanOrEqual(answer);
  });

  test("What a value describes: text and figure 2.5rem apart, the figure centred", async ({
    page,
  }) => {
    await page.goto("/about/data");
    const layout = await page.evaluate(() => {
      const grid = document.querySelector("#cell-values > div");
      const [text, figure] = [...(grid?.children ?? [])].map((child) =>
        child.getBoundingClientRect(),
      );
      const box = grid?.getBoundingClientRect();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const gap = parseFloat(getComputedStyle(grid!).columnGap);
      const columnLeft = (text?.right ?? 0) + gap;
      return {
        gap: ((figure?.left ?? 0) - (text?.right ?? 0)) / rem,
        offsetX:
          (figure?.left ?? 0) + (figure?.width ?? 0) / 2 - (columnLeft + (box?.right ?? 0)) / 2,
        offsetY:
          (figure?.top ?? 0) +
          (figure?.height ?? 0) / 2 -
          ((box?.top ?? 0) + (box?.height ?? 0) / 2),
      };
    });
    expect(layout.gap).toBeGreaterThanOrEqual(2.5);
    expect(Math.abs(layout.offsetX)).toBeLessThanOrEqual(1);
    expect(Math.abs(layout.offsetY)).toBeLessThanOrEqual(1);
  });
});

test.describe("Info scroll spy on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("at the end of the page the Contents bar names the last section", async ({ page }) => {
    await page.goto("/about");
    await scrollMainToEnd(page);
    await expect(breadcrumb(page)).toHaveText("AboutPrivacy");
  });

  test("a section picked in the sheet stays current until the user scrolls", async ({ page }) => {
    await page.goto("/about");
    for (const name of ["Privacy", "Source code and versions"]) {
      await contentsButton(page).click();
      await page.getByRole("dialog").getByRole("link", { name, exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(breadcrumb(page)).toHaveText(`About${name}`);
      await page.waitForTimeout(SETTLE_MS);
      await expect(breadcrumb(page)).toHaveText(`About${name}`);
    }
  });
});

test.describe("Info cards on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("card text and card links are at least 15px, the titles larger", async ({ page }) => {
    await page.goto("/about");
    const cards = page.locator("#data-sources li");
    const texts = await fontSizeOf(cards.locator("p"));
    const links = await fontSizeOf(cards.locator("a"));
    const titles = await fontSizeOf(cards.locator("h3"));
    expect(texts.length).toBeGreaterThan(0);
    expect(links.length).toBeGreaterThan(0);
    for (const size of [...texts, ...links]) expect(size).toBeGreaterThanOrEqual(15);
    for (const size of titles) expect(size).toBeGreaterThan(Math.max(...texts));
  });
});
