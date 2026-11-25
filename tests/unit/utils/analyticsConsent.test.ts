import {
  ANALYTICS_CONSENT,
  GA_PAGE_TITLES,
  INFO_PAGES,
  LOCAL_STORAGE_KEYS,
  NAV_LINKS,
  ROUTES,
} from "@/constants";
import en from "@/i18n/locales/en.json";
import { EAnalyticsConsent } from "@/enums";
import type { TKeyValueStorage } from "@/types";
import {
  createConsentRecord,
  createConsentStore,
  createPageViewTracker,
  getCookieDomains,
  getGaCookieNames,
  getGaPageTitle,
  getPageUrl,
} from "@/utils/analyticsConsent.util";
import { describe, expect, it } from "vitest";

const NOW = Date.UTC(2026, 10, 24);
const DAY = 24 * 60 * 60 * 1000;

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  const storage: TKeyValueStorage = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
  return { storage, items };
}

const storeAt = (storage: TKeyValueStorage, now: number) =>
  createConsentStore({ getStorage: () => storage, getNow: () => now });

const stored = (value: unknown) => ({
  [LOCAL_STORAGE_KEYS.ANALYTICS_CONSENT]: JSON.stringify(value),
});

describe("analytics consent storage", () => {
  it("has no choice until one is made", () => {
    expect(storeAt(memoryStorage().storage, NOW).getSnapshot()).toBeNull();
  });

  it.each([EAnalyticsConsent.GRANTED, EAnalyticsConsent.DENIED])(
    "keeps %s with the consent version and the time, across a reload",
    (choice) => {
      const { storage, items } = memoryStorage();
      storeAt(storage, NOW).set(createConsentRecord(choice, NOW));
      expect(JSON.parse(items.get(LOCAL_STORAGE_KEYS.ANALYTICS_CONSENT) ?? "")).toEqual({
        choice,
        version: ANALYTICS_CONSENT.VERSION,
        decidedAt: NOW,
      });
      expect(storeAt(storage, NOW + DAY).getSnapshot()?.choice).toBe(choice);
    },
  );

  it("asks again when the consent version changes", () => {
    const { storage } = memoryStorage(
      stored({ choice: "granted", version: ANALYTICS_CONSENT.VERSION - 1, decidedAt: NOW }),
    );
    expect(storeAt(storage, NOW).getSnapshot()).toBeNull();
  });

  it("asks again 12 months after the choice, not before", () => {
    const { storage } = memoryStorage(
      stored(createConsentRecord(EAnalyticsConsent.DENIED, NOW - 364 * DAY)),
    );
    expect(storeAt(storage, NOW).getSnapshot()?.choice).toBe(EAnalyticsConsent.DENIED);
    expect(storeAt(storage, NOW + 2 * DAY).getSnapshot()).toBeNull();
  });

  it.each([
    ["an unknown choice", { choice: "maybe", version: 1, decidedAt: NOW }],
    ["no time", { choice: "granted", version: 1 }],
    ["a time in the future", { choice: "granted", version: 1, decidedAt: NOW + DAY }],
  ])("reads %s as no choice", (_, value) => {
    expect(storeAt(memoryStorage(stored(value)).storage, NOW).getSnapshot()).toBeNull();
  });

  it("reads a broken entry as no choice", () => {
    const { storage } = memoryStorage({ [LOCAL_STORAGE_KEYS.ANALYTICS_CONSENT]: "{" });
    expect(storeAt(storage, NOW).getSnapshot()).toBeNull();
  });
});

describe("GA cookies", () => {
  it("finds _ga and _ga_<container>, nothing else", () => {
    expect(
      getGaCookieNames("NEXT_LOCALE=en; _ga=GA1.1.1; _ga_ABC123=GS1.1; _gat=1; x_ga=2"),
    ).toEqual(["_ga", "_ga_ABC123"]);
  });

  it("lists the host and every domain above it", () => {
    expect(getCookieDomains("climatica.gsic.uva.es")).toEqual([
      "climatica.gsic.uva.es",
      "gsic.uva.es",
      "uva.es",
      "es",
    ]);
    expect(getCookieDomains("localhost")).toEqual(["localhost"]);
  });
});

describe("the URL sent to Google", () => {
  it.each([
    [
      "https://climatica.gsic.uva.es/climate-statistics?city=Paris&lat=48.8566&lng=2.3522",
      "https://climatica.gsic.uva.es/climate-statistics",
    ],
    ["https://climatica.gsic.uva.es/about#privacy", "https://climatica.gsic.uva.es/about"],
    [
      "https://climatica.gsic.uva.es/heat-map?north=1&polygon=POLYGON((0 0))#x",
      "https://climatica.gsic.uva.es/heat-map",
    ],
    ["https://climatica.gsic.uva.es/about/guide/", "https://climatica.gsic.uva.es/about/guide"],
    ["https://climatica.gsic.uva.es/about//", "https://climatica.gsic.uva.es/about"],
    ["https://climatica.gsic.uva.es/?q=1", "https://climatica.gsic.uva.es/"],
    ["https://climatica.gsic.uva.es", "https://climatica.gsic.uva.es/"],
    ["http://localhost:3001/compare-cities?latA=1#a", "http://localhost:3001/compare-cities"],
  ])("%s → %s", (href, expected) => {
    expect(getPageUrl(href)).toBe(expected);
  });

  it("is empty for no referrer", () => {
    expect(getPageUrl("")).toBe("");
  });
});

describe("the page title sent to Google", () => {
  it.each([
    ["/climate-statistics", "City Climate"],
    ["/compare-cities", "Compare Cities"],
    ["/compare-periods", "Compare Periods"],
    ["/heat-map/", "Region Heatmap"],
    ["/about", "About"],
    ["/about/guide", "User guide"],
    ["/about/data", "Data & methods"],
    ["/settings", "Settings"],
    ["/nowhere", "Climatica"],
  ])("%s → %s", (pathname, title) => {
    expect(getGaPageTitle(pathname)).toBe(title);
  });

  it("names every page as its English title does", () => {
    const pages = [
      ...NAV_LINKS.map(({ to, labelKey }) => ({ route: to, labelKey })),
      ...INFO_PAGES.map(({ route, labelKey }) => ({ route, labelKey })),
      { route: ROUTES.SETTINGS, labelKey: "pages.settings.title" },
    ];
    for (const { route, labelKey } of pages) {
      const english = labelKey
        .split(".")
        .reduce<unknown>(
          (node, key) =>
            typeof node === "object" && node !== null ? Reflect.get(node, key) : null,
          en,
        );
      expect(GA_PAGE_TITLES[route]).toBe(english);
    }
  });
});

describe("the page-view guard", () => {
  it("sends the same path twice in a row once", () => {
    const tracker = createPageViewTracker();
    const sent = ["/about", "/about"].filter((path) => tracker.visit(path).isNew);
    expect(sent).toEqual(["/about"]);
  });

  it("sends A → B → A three times, each with the page before it", () => {
    const tracker = createPageViewTracker();
    expect(["/a", "/b", "/a"].map((path) => tracker.visit(path))).toEqual([
      { isNew: true, previous: null },
      { isNew: true, previous: "/a" },
      { isNew: true, previous: "/b" },
    ]);
  });

  it("skips a repeat without forgetting the page before it", () => {
    const tracker = createPageViewTracker();
    tracker.visit("/a");
    tracker.visit("/b");
    expect(tracker.visit("/b")).toEqual({ isNew: false });
    expect(tracker.visit("/c")).toEqual({ isNew: true, previous: "/b" });
  });
});
