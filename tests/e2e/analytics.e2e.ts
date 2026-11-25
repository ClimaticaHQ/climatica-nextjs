import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { E2E_GA_ID, REAL_GTAG_TAG } from "./analytics.constant";

// * runs only in the "analytics" project, on the server built with a test GA ID
const GOOGLE = /^https:\/\/([a-z0-9-]+\.)*(googletagmanager|google-analytics)\.com\//;
const CONSENT_KEY = "climatica:analyticsConsent";
const CITY_URL = "/climate-statistics?city=Paris&lat=48.8566&lng=2.3522";
const CLS_LIMIT = 0.02;
const SETTLE_MS = 1500;
const GA_COLLECT = /google-analytics\.com\/g\/collect/;
const GTAG_SCRIPT = /googletagmanager\.com\/gtag\/js/;
const ANY_GOOGLE =
  /^https:\/\/([a-z0-9-]+\.)*(google|googletagmanager|google-analytics|doubleclick|gstatic)\.[a-z.]+\//;
// * longer than gtag.js holds a batch of hits
const FLUSH_MS = 9000;
const HIT_POLL = { timeout: 20_000 };
const ORIGIN = "http://localhost:3001";
const LEAKED_PARAMS = /[?&](lat|lng|latA|north|polygon)=/;
const HERE = { latitude: 41.652251, longitude: -4.724532 };
const PLACE_NAMES = ["Paris", "Valladolid", "My location"];
const LANGUAGE_COOKIE = "NEXT_LOCALE";
const GERMAN = { accept: "Akzeptieren", about: "Über" };
const GA_COOKIES = ["_ga", `_ga_${E2E_GA_ID.slice(2)}`];

// * long pages: the document's and the app's scroll container (<main>) must not grow with the banner
const SCROLL_HEIGHT_PAGES = ["/compare-cities", "/about"];
const SCROLL_VIEWPORTS = [
  { name: "a desktop", viewport: { width: 1440, height: 900 }, isMobile: false },
  { name: "a phone", viewport: { width: 390, height: 844 }, isMobile: true },
];
const scrollHeights = (page: Page) =>
  page.evaluate(() => ({
    document: document.scrollingElement?.scrollHeight ?? 0,
    main: document.querySelector("main")?.scrollHeight ?? 0,
  }));

const banner = (page: Page) => page.getByRole("region", { name: "Analytics consent" });
const analyticsSwitch = (page: Page) => page.getByRole("checkbox", { name: /^Analytics/ });
// * the switch's input is visually hidden: its label is what a reader presses
const pressAnalyticsSwitch = (page: Page) =>
  page
    .locator("label")
    .filter({ has: analyticsSwitch(page) })
    .click();
const storedChoice = (page: Page) =>
  page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? "null")?.choice ?? null,
    CONSENT_KEY,
  );
const gaCookieNames = async (context: BrowserContext) =>
  (await context.cookies()).map(({ name }) => name).filter((name) => name.startsWith("_ga"));

async function interceptGoogle(context: BrowserContext) {
  const requests: string[] = [];
  await context.route(GOOGLE, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  return requests;
}

type THit = {
  event: string | null;
  location: string | null;
  referrer: string | null;
  title: string | null;
  language: string | null;
  raw: string;
};

async function captureHits(context: BrowserContext) {
  const hits: THit[] = [];
  await context.route(ANY_GOOGLE, (route) => {
    const request = route.request();
    if (GTAG_SCRIPT.test(request.url())) return route.continue();
    if (!GA_COLLECT.test(request.url())) {
      hits.push({
        event: null,
        location: null,
        referrer: null,
        title: null,
        language: null,
        raw: request.url(),
      });
      return route.fulfill({ status: 204 });
    }
    const url = new URL(request.url());
    const body = (request.postData() ?? "").split("\r\n").filter(Boolean);
    for (const line of body.length ? body : [""]) {
      const event = new URLSearchParams(line);
      const read = (key: string) => event.get(key) ?? url.searchParams.get(key);
      hits.push({
        event: read("en"),
        location: read("dl"),
        referrer: read("dr"),
        title: read("dt"),
        language: read("up.app_language"),
        raw: decodeURIComponent(`${request.url()} ${request.postData() ?? ""}`),
      });
    }
    return route.fulfill({ status: 204 });
  });
  return hits;
}
const pageViews = (hits: readonly THit[]) => hits.filter(({ event }) => event === "page_view");

const queuedTitles = (page: Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .flatMap(([command, fields]) =>
        command === "set" && typeof fields === "object" && fields !== null && "page_title" in fields
          ? [String(fields.page_title)]
          : [],
      ),
  );

const queuedLanguageAndViews = (page: Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .flatMap(([command, name, fields]) => {
        if (command === "event" && name === "page_view") return ["page_view"];
        const isLanguage =
          command === "set" &&
          name === "user_properties" &&
          typeof fields === "object" &&
          fields !== null &&
          "app_language" in fields;
        return isLanguage ? [`app_language=${String(fields.app_language)}`] : [];
      }),
  );

async function chooseLanguage(page: Page, code: string) {
  await page.getByTestId("language-switcher").click();
  await page.getByTestId(`language-option-${code}`).click();
}

async function useGerman(context: BrowserContext, baseURL: string | undefined) {
  await context.addCookies([{ name: LANGUAGE_COOKIE, value: "de", url: baseURL ?? "" }]);
}

async function pickInSidebar(page: Page, label: string, value: string) {
  const dropdown = page
    .locator("aside")
    .getByText(label, { exact: true })
    .locator("xpath=ancestor-or-self::*[following-sibling::div][1]/following-sibling::div[1]");
  await dropdown.locator("button").first().click();
  await dropdown.locator(`button[data-value="${value}"]`).click();
  await page.getByRole("button", { name: "Apply filters" }).click();
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(SETTLE_MS);
}

test.describe("Google Analytics, asked first", () => {
  test("nothing is requested from Google before a choice", async ({ page, context }) => {
    const requests = await interceptGoogle(context);
    await page.goto("/about");
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Accept" })).toBeVisible();
    await expect(banner(page).getByRole("button", { name: "Reject" })).toBeVisible();
    await expect(banner(page).getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/about#privacy",
    );
    await settle(page);
    expect(requests).toEqual([]);
    await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  });

  test("Accept and Reject are the same size and weight", async ({ page }) => {
    await page.goto("/about");
    const look = (name: string) =>
      banner(page)
        .getByRole("button", { name })
        .evaluate((button) => {
          const { width, height } = button.getBoundingClientRect();
          const style = getComputedStyle(button);
          return {
            width,
            height,
            weight: style.fontWeight,
            colour: style.color,
            font: style.fontSize,
          };
        });
    expect(await look("Accept")).toEqual(await look("Reject"));
  });

  test("the banner is on every page until a choice, and gone after", async ({ page }) => {
    for (const url of ["/about", "/settings", CITY_URL]) {
      await page.goto(url);
      await expect(banner(page)).toBeVisible();
    }
    await banner(page).getByRole("button", { name: "Reject" }).click();
    await expect(banner(page)).toHaveCount(0);
    await page.goto("/about");
    await settle(page);
    await expect(banner(page)).toHaveCount(0);
  });

  test("after Reject nothing is requested from Google", async ({ page, context }) => {
    const requests = await interceptGoogle(context);
    await page.goto("/about");
    await banner(page).getByRole("button", { name: "Reject" }).click();
    expect(await storedChoice(page)).toBe("denied");
    await page.getByRole("link", { name: "Guide" }).first().click();
    await page.reload();
    await settle(page);
    expect(requests).toEqual([]);
  });

  test("Accept loads GA's script, without ads or signals, and again on the next visit", async ({
    page,
    context,
  }) => {
    const requests = await interceptGoogle(context);
    await page.goto("/about");
    await settle(page);
    expect(requests).toEqual([]);
    await banner(page).getByRole("button", { name: "Accept" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect
      .poll(() => requests.some((url) => url.includes(`/gtag/js?id=${E2E_GA_ID}`)))
      .toBe(true);
    expect(await storedChoice(page)).toBe("granted");
    const queue = await page.evaluate(() =>
      (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>)),
    );
    const index = (command: string) => queue.findIndex(([name]) => name === command);
    expect(queue[index("consent")]).toEqual([
      "consent",
      "default",
      expect.objectContaining({ ad_storage: "denied", analytics_storage: "granted" }),
    ]);
    expect(queue[index("set")]?.[1]).toEqual({
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
      page_location: "http://localhost:3001/about",
      page_referrer: "",
      page_title: "Climatica",
    });
    expect(index("consent")).toBeLessThan(index("config"));

    requests.length = 0;
    await page.reload();
    await expect.poll(() => requests.some((url) => url.includes("/gtag/js"))).toBe(true);
    await expect(banner(page)).toHaveCount(0);
  });

  test("the Settings switch changes the choice, and withdrawing removes GA's cookies", async ({
    page,
    context,
  }) => {
    const requests = await interceptGoogle(context);
    await page.goto("/settings");
    await expect(analyticsSwitch(page)).not.toBeChecked();
    await pressAnalyticsSwitch(page);
    await expect(analyticsSwitch(page)).toBeChecked();
    expect(await storedChoice(page)).toBe("granted");
    await expect(banner(page)).toHaveCount(0);
    await expect.poll(() => requests.some((url) => url.includes("/gtag/js"))).toBe(true);

    await context.addCookies(
      GA_COOKIES.map((name) => ({ name, value: "GA1.1.1", domain: "localhost", path: "/" })),
    );
    expect(await gaCookieNames(context)).toEqual(expect.arrayContaining(GA_COOKIES));
    await pressAnalyticsSwitch(page);
    await expect(analyticsSwitch(page)).not.toBeChecked();
    expect(await storedChoice(page)).toBe("denied");
    await expect.poll(() => gaCookieNames(context)).toEqual([]);
    expect(await page.evaluate((id) => window[`ga-disable-${id}`], E2E_GA_ID)).toBe(true);
  });

  test("Cookie settings, in the footer and in Privacy, open the banner again", async ({
    page,
    context,
  }) => {
    const requests = await interceptGoogle(context);
    await page.goto("/about");
    await banner(page).getByRole("button", { name: "Accept" }).click();
    await context.addCookies([{ name: "_ga", value: "GA1.1.1", domain: "localhost", path: "/" }]);

    await page.getByRole("contentinfo").getByRole("button", { name: "Cookie settings" }).click();
    await expect(banner(page)).toBeVisible();
    await banner(page).getByRole("button", { name: "Reject" }).click();
    expect(await storedChoice(page)).toBe("denied");
    await expect.poll(() => gaCookieNames(context)).toEqual([]);

    const privacy = page.locator("#privacy");
    await expect(privacy).toContainText("Google Analytics");
    await privacy.getByRole("button", { name: "Cookie settings" }).click();
    await expect(banner(page)).toBeVisible();
    requests.length = 0;
    await page.goto("/settings");
    await expect(analyticsSwitch(page)).not.toBeChecked();
    expect(requests).toEqual([]);
  });

  test("in German our code still sets the English page names", async ({
    page,
    context,
    baseURL,
  }) => {
    await interceptGoogle(context);
    await useGerman(context, baseURL);
    await page.goto(CITY_URL);
    await page.getByRole("button", { name: GERMAN.accept }).click();
    await expect.poll(() => queuedTitles(page)).toEqual(["Climatica", "City Climate"]);
    await page.getByRole("banner").getByRole("link", { name: GERMAN.about }).first().click();
    await expect(page).toHaveURL(/\/about(\?|$)/);
    await expect.poll(() => queuedTitles(page)).toEqual(["Climatica", "City Climate", "About"]);
  });

  test("the app language is set before each page view, and again on a language switch", async ({
    page,
    context,
    baseURL,
  }) => {
    await interceptGoogle(context);
    await useGerman(context, baseURL);
    await page.goto("/settings");
    await page.getByRole("button", { name: GERMAN.accept }).click();
    await expect.poll(() => queuedLanguageAndViews(page)).toEqual(["app_language=de", "page_view"]);
    await chooseLanguage(page, "uk");
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect
      .poll(() => queuedLanguageAndViews(page))
      .toEqual(["app_language=de", "page_view", "app_language=uk"]);
    await page.locator('header a[href^="/about"]').first().click();
    await expect(page).toHaveURL(/\/about(\?|$)/);
    await expect
      .poll(() => queuedLanguageAndViews(page))
      .toEqual(["app_language=de", "page_view", "app_language=uk", "page_view"]);
  });

  test.describe("page views, with GA's real script", { tag: REAL_GTAG_TAG }, () => {
    test.describe.configure({ timeout: 90_000 });
    test.use({ geolocation: HERE, permissions: ["geolocation"] });
    let recorded: THit[] = [];
    test.afterEach(async ({}, testInfo) => {
      const views = pageViews(recorded).map(({ location }) => new URL(location ?? ORIGIN).pathname);
      testInfo.annotations.push({
        type: "page_views",
        description: `${views.length}: ${views.join(" → ")}`,
      });
      recorded = [];
    });

    test("one page view per path, never a query string or a place", async ({ page, context }) => {
      const hits = await captureHits(context);
      recorded = hits;
      await page.goto(`${CITY_URL}#data`);
      await expect(page).toHaveTitle(/Paris/);
      await banner(page).getByRole("button", { name: "Accept" }).click();
      await expect.poll(() => pageViews(hits).length, HIT_POLL).toBe(1);
      expect(pageViews(hits)[0]).toEqual(
        expect.objectContaining({
          location: `${ORIGIN}/climate-statistics`,
          title: "City Climate",
        }),
      );

      await pickInSidebar(page, "Cell resolution", "10m");
      await expect.poll(() => new URL(page.url()).searchParams.get("grid")).toBe("10m");
      await page.waitForTimeout(FLUSH_MS);
      expect(pageViews(hits)).toHaveLength(1);

      await page
        .getByRole("button", { name: /my location/i })
        .first()
        .click();
      await expect.poll(() => new URL(page.url()).searchParams.get("lat")).toBe("41.6523");
      await expect(page).toHaveTitle(/Valladolid|My location/);

      await page.getByRole("banner").getByRole("link", { name: "About" }).first().click();
      await expect(page).toHaveURL(/\/about(\?|$)/);
      await expect.poll(() => pageViews(hits).length, HIT_POLL).toBe(2);
      await page.waitForTimeout(FLUSH_MS);
      expect(pageViews(hits).slice(1)).toEqual([
        expect.objectContaining({
          location: `${ORIGIN}/about`,
          referrer: `${ORIGIN}/climate-statistics`,
          title: "About",
        }),
      ]);

      expect(hits.length).toBeGreaterThan(0);
      expect(hits.filter(({ raw }) => LEAKED_PARAMS.test(raw))).toEqual([]);
      for (const name of PLACE_NAMES) {
        expect(hits.filter(({ raw }) => raw.includes(name))).toEqual([]);
      }
      expect(hits.filter(({ location }) => /[?#]/.test(location ?? ""))).toEqual([]);
    });

    test("in German the hits carry the English page names", async ({ page, context, baseURL }) => {
      const hits = await captureHits(context);
      recorded = hits;
      await useGerman(context, baseURL);
      await page.goto(CITY_URL);
      await page.getByRole("button", { name: GERMAN.accept }).click();
      await expect.poll(() => pageViews(hits).length, HIT_POLL).toBe(1);
      await page.getByRole("banner").getByRole("link", { name: GERMAN.about }).first().click();
      await expect.poll(() => pageViews(hits).length, HIT_POLL).toBe(2);
      expect(pageViews(hits).map(({ title }) => title)).toEqual(["City Climate", "About"]);
      expect(hits.filter(({ raw }) => /Klima der Stadt|Über/.test(raw))).toEqual([]);
    });

    test("hits carry the app language: de after Accept, uk after switching", async ({
      page,
      context,
      baseURL,
    }) => {
      const hits = await captureHits(context);
      recorded = hits;
      await useGerman(context, baseURL);
      await page.goto("/settings");
      await page.getByRole("button", { name: GERMAN.accept }).click();
      await expect.poll(() => pageViews(hits).length, HIT_POLL).toBe(1);
      expect(pageViews(hits)[0]?.language).toBe("de");

      await chooseLanguage(page, "uk");
      await expect(page.locator("html")).toHaveAttribute("lang", "uk");
      const sent = hits.length;
      await page.locator('header a[href^="/about"]').first().click();
      await expect
        .poll(() => hits.slice(sent).some(({ event }) => event !== null), HIT_POLL)
        .toBe(true);
      const next = hits.slice(sent).find(({ event }) => event !== null);
      expect(next?.language).toBe("uk");
    });
  });

  for (const { name, viewport, isMobile } of SCROLL_VIEWPORTS) {
    test.describe(`on ${name}`, () => {
      test.use({ viewport, isMobile, hasTouch: isMobile });

      test("the banner overlays the page: no scroll height of its own", async ({ page }) => {
        for (const url of SCROLL_HEIGHT_PAGES) {
          await page.goto(url);
          await expect(banner(page)).toBeVisible();
          await settle(page);
          expect(await banner(page).evaluate((element) => element.parentElement?.tagName)).toBe(
            "BODY",
          );
          const withBanner = await scrollHeights(page);
          await banner(page).getByRole("button", { name: "Reject" }).click();
          await expect(banner(page)).toHaveCount(0);
          expect(await scrollHeights(page)).toEqual(withBanner);
          await page.evaluate((key) => localStorage.removeItem(key), CONSENT_KEY);
        }
      });
    });
  }

  test.describe("on a 360px phone", () => {
    test.use({ viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true });

    test("the banner shifts nothing", async ({ page }) => {
      await page.addInitScript(() => {
        const target = window as Window & { __cls?: number };
        target.__cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & { value: number };
            target.__cls = (target.__cls ?? 0) + shift.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto("/about");
      await expect(banner(page)).toBeVisible();
      await settle(page);
      const cls = await page.evaluate(() => (window as Window & { __cls?: number }).__cls ?? 0);
      expect(cls).toBeLessThan(CLS_LIMIT);
      expect(await banner(page).evaluate((element) => getComputedStyle(element).position)).toBe(
        "fixed",
      );
    });

    test("the Contents bar and the filter sheet's buttons stay reachable", async ({ page }) => {
      await page.goto("/about");
      await expect(banner(page)).toBeVisible();
      // * trial: Playwright's hit test, nothing clicked
      await page.getByRole("button", { name: "Contents" }).click({ trial: true });

      await page.goto(CITY_URL);
      await expect(banner(page)).toBeVisible();
      const filters = page.getByRole("button", { name: /^Filters/ });
      await filters.click({ trial: true });
      await filters.click();
      const sheet = page.getByRole("dialog", { name: "Filters" });
      await expect(sheet).toBeVisible();
      await sheet.getByRole("button", { name: "Close" }).click({ trial: true });
      await sheet.getByRole("button", { name: "Apply" }).click({ trial: true });
      await sheet.getByRole("button", { name: "Reset" }).click({ trial: true });
    });
  });
});
