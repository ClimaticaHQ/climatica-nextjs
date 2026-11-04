import { FIRST_RELEASE_YEAR, PROJECT_INFO } from "@/constants/project.constant";
import { formatCopyrightYears } from "@/utils/info.util";
import { devices, expect, test, type Page } from "@playwright/test";

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
    // * the guide's own sections, nested under it — not another page's; no headings in the nav
    await expect(sectionLink(page, "Questions")).toBeVisible();
    await expect(sectionLink(page, "Spatial resolutions")).toHaveCount(0);
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
      const profile = page.getByRole("link", { name: `${name} (opens in a new tab)` });
      await expect(profile).toHaveAttribute("href", href);
      await expect(profile).toHaveAttribute("target", "_blank");
      await expect(profile).toHaveAttribute("rel", "noopener noreferrer");
      const card = page.locator("li", { has: profile });
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
        const name = item.querySelector("a")?.getBoundingClientRect();
        return {
          top: Math.round(card?.top ?? 0),
          height: Math.round(card?.height ?? 0),
          avatarTop: Math.round(avatar?.top ?? 0),
          nameTop: Math.round(name?.top ?? 0),
        };
      }),
    );
    expect(cards).toHaveLength(TEAM_CARDS.length);
    const rows = Map.groupBy(cards, ({ top }) => top);
    expect([...rows.values()].some((row) => row.length > 1)).toBe(true);
    for (const row of rows.values()) {
      expect(new Set(row.map(({ height }) => height)).size).toBe(1);
    }
    for (const { avatarTop, nameTop } of cards) {
      // * top-aligned: the avatar starts with the name line, not centred down the card
      expect(Math.abs(avatarTop - nameTop)).toBeLessThanOrEqual(4);
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

test.describe("Info pages on a phone", () => {
  // * the phone's screen and touch, not its browser type: that would need a worker of its own
  const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices["Pixel 7"];
  test.use({ viewport, userAgent, deviceScaleFactor, isMobile, hasTouch });

  test("the resolution sheet's link closes the sheet and leads to the resolutions", async ({
    page,
  }) => {
    await page.goto(CITY_URL);
    await page.getByRole("button", { name: "Resolution: 2.5 min" }).click();
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
