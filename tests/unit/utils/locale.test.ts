import {
  matchAcceptLanguage,
  parseLocale,
  resolveRequestLocale,
  stripLocalePrefix,
} from "@/utils/locale.util";
import { describe, expect, it } from "vitest";

describe("resolveRequestLocale — cookie, then Accept-Language, then English", () => {
  it("uses the visitor's cookie first", () => {
    expect(resolveRequestLocale({ cookieLocale: "uk", acceptLanguage: "de-DE,de;q=0.9" })).toBe(
      "uk",
    );
  });

  it("uses the browser's language without a cookie, or with an unsupported one", () => {
    expect(
      resolveRequestLocale({ cookieLocale: undefined, acceptLanguage: "fr-CA,fr;q=0.9" }),
    ).toBe("fr");
    expect(resolveRequestLocale({ cookieLocale: "xx", acceptLanguage: "es" })).toBe("es");
  });

  it("falls back to English when neither names a supported language", () => {
    expect(resolveRequestLocale({ cookieLocale: null, acceptLanguage: "ja,zh;q=0.8" })).toBe("en");
    expect(resolveRequestLocale({ cookieLocale: null, acceptLanguage: null })).toBe("en");
  });
});

describe("matchAcceptLanguage", () => {
  it("takes the best-weighted supported language, by its language part", () => {
    expect(matchAcceptLanguage("ja;q=0.9, pt-BR;q=0.8, de;q=0.7")).toBe("pt");
    expect(matchAcceptLanguage("de;q=0.5, it;q=0.9")).toBe("it");
  });

  it("keeps the header's order between equal weights", () => {
    expect(matchAcceptLanguage("ro, el")).toBe("ro");
  });

  it("maps Norwegian to Bokmål, and skips * and q=0", () => {
    expect(matchAcceptLanguage("no")).toBe("nb");
    expect(matchAcceptLanguage("*, uk;q=0, el;q=0.1")).toBe("el");
  });

  it("names nothing for an empty or unsupported header", () => {
    expect(matchAcceptLanguage("")).toBeNull();
    expect(matchAcceptLanguage("ja-JP")).toBeNull();
  });
});

describe("parseLocale and stripLocalePrefix", () => {
  it("keeps a supported locale, else English", () => {
    expect(parseLocale("el")).toBe("el");
    expect(parseLocale("xx")).toBe("en");
    expect(parseLocale(undefined)).toBe("en");
  });

  it("drops a leading locale segment from an old link", () => {
    expect(stripLocalePrefix("/ro/compare-cities")).toBe("/compare-cities");
    expect(stripLocalePrefix("/uk")).toBe("/");
    expect(stripLocalePrefix("/en/heat-map/x")).toBe("/heat-map/x");
  });

  it("leaves a path without one", () => {
    expect(stripLocalePrefix("/compare-cities")).toBeNull();
    expect(stripLocalePrefix("/")).toBeNull();
    expect(stripLocalePrefix("/settings")).toBeNull();
  });
});
