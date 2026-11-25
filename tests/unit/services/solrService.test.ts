import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/libs/Env", () => ({ env: { SOLR_URL: "http://localhost:8983" } }));
vi.mock("@/libs/Logger", () => ({ logger: { info: vi.fn(), error: vi.fn() } }));

import { SOLR_QUERY_PARAMS } from "@/constants";
import { SolrService } from "@/libs/services/solrService";
import type { TSolrCityDoc, TSolrResponse } from "@/types";

function makeSolrDoc(overrides: Partial<TSolrCityDoc> = {}): TSolrCityDoc {
  return {
    geonameid: 3169070,
    label_en: "Rome",
    label_uk: "Рим",
    label_es: "Roma",
    latitude: 41.8919,
    longitude: 12.5113,
    population: 2318895,
    feature_code: "PPLC",
    country_code: "IT",
    ...overrides,
  };
}

function makeSolrResponse(docs: TSolrCityDoc[]): TSolrResponse {
  return {
    responseHeader: { status: 0, QTime: 5 },
    response: { numFound: docs.length, docs },
  };
}

function stubFetch(body: unknown, ok = true): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(body),
    }),
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("SolrService.searchCities", () => {
  it("returns mapped TCity[] on successful response", async () => {
    stubFetch(makeSolrResponse([makeSolrDoc()]));
    const results = await SolrService.searchCities("rome", "en");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: "3169070",
      label: "Rome",
      lat: 41.8919,
      lng: 12.5113,
    });
  });

  it("returns [] on empty Solr response (numFound: 0)", async () => {
    stubFetch(makeSolrResponse([]));
    const results = await SolrService.searchCities("xyz", "en");
    expect(results).toEqual([]);
  });

  // * an outage must not look like "no cities found"
  it("rejects when fetch throws an error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    await expect(SolrService.searchCities("rome", "en")).rejects.toThrow("network error");
  });

  it("rejects when Solr responds with non-ok HTTP status", async () => {
    stubFetch({}, false);
    await expect(SolrService.searchCities("rome", "en")).rejects.toThrow(/status/);
  });

  it("rejects when Solr reports a non-zero responseHeader status", async () => {
    stubFetch({ ...makeSolrResponse([]), responseHeader: { status: 400, QTime: 1 } });
    await expect(SolrService.searchCities("rome", "en")).rejects.toThrow(/Solr error status/);
  });

  it("uses label_en when lang is en", async () => {
    stubFetch(makeSolrResponse([makeSolrDoc({ label_en: "Rome", label_uk: "Рим" })]));
    const results = await SolrService.searchCities("rome", "en");
    expect(results[0].label).toBe("Rome");
  });

  it("uses label_uk when lang is uk", async () => {
    stubFetch(makeSolrResponse([makeSolrDoc({ label_en: "Rome", label_uk: "Рим" })]));
    const results = await SolrService.searchCities("рим", "uk");
    expect(results[0].label).toBe("Рим");
  });

  it("uses label_es when lang is es", async () => {
    stubFetch(makeSolrResponse([makeSolrDoc({ label_en: "Rome", label_es: "Roma" })]));
    const results = await SolrService.searchCities("roma", "es");
    expect(results[0].label).toBe("Roma");
  });

  // regression: solrconfig.xml's fl default once stripped label_<lang> beyond en/uk/es
  it("uses label_el when lang is el and the doc has a distinct Greek label", async () => {
    stubFetch(
      makeSolrResponse([makeSolrDoc({ label_en: "Andorra la Vella", label_el: "Ανδόρρα" })]),
    );
    const results = await SolrService.searchCities("Ανδόρρα", "el");
    expect(results[0].label).toBe("Ανδόρρα");
    expect(results[0].label).not.toBe("Andorra la Vella");
  });

  it("deduplicates results by geonameid", async () => {
    const doc = makeSolrDoc({ geonameid: 3169070 });
    stubFetch(makeSolrResponse([doc, doc, { ...doc, label_en: "Rome duplicate" }]));
    const results = await SolrService.searchCities("rome", "en");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("3169070");
  });

  it("builds a Solr URL with the exact and fuzzy clauses for a multi-word query", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(makeSolrResponse([])),
    });
    vi.stubGlobal("fetch", fetchMock);

    await SolrService.searchCities("new york", "en");

    const params = new URL(fetchMock.mock.calls[0][0]).searchParams;
    expect(params.get(SOLR_QUERY_PARAMS.EXACT_TEXT)).toBe("new york");
    expect(params.get(SOLR_QUERY_PARAMS.FUZZY_TEXT)).toBe("new york~1");
    expect(params.get(SOLR_QUERY_PARAMS.EXACT_QF)).toContain("names");
    expect(params.get(SOLR_QUERY_PARAMS.EXACT_PF)).toBe("names^10");
  });
});

describe("SolrService.getLabelField", () => {
  it("returns label_en for lang en", () => {
    expect(SolrService.getLabelField("en")).toBe("label_en");
  });

  it("returns label_uk for lang uk", () => {
    expect(SolrService.getLabelField("uk")).toBe("label_uk");
  });

  it("returns label_es for lang es", () => {
    expect(SolrService.getLabelField("es")).toBe("label_es");
  });

  it("returns label_el for lang el", () => {
    expect(SolrService.getLabelField("el")).toBe("label_el");
  });

  it("returns label_fr for lang fr (a locale added after es/uk/en)", () => {
    expect(SolrService.getLabelField("fr")).toBe("label_fr");
  });

  it("falls back to label_en for a lang outside the supported locale list", () => {
    expect(SolrService.getLabelField("xx")).toBe("label_en");
  });
});

describe("SolrService.findNearestCity", () => {
  it("names the nearest place in the language", async () => {
    stubFetch(makeSolrResponse([makeSolrDoc()]));
    const city = await SolrService.findNearestCity({ lat: 41.9, lng: 12.5, lang: "uk" });
    expect(city).toMatchObject({ id: "3169070", label: "Рим", lat: 41.8919, lng: 12.5113 });
  });

  it("falls back to the English label where the index has none in the language", async () => {
    stubFetch(makeSolrResponse([makeSolrDoc({ label_uk: undefined })]));
    const city = await SolrService.findNearestCity({ lat: 41.9, lng: 12.5, lang: "uk" });
    expect(city?.label).toBe("Rome");
  });

  it("answers null when no place is within the radius", async () => {
    stubFetch(makeSolrResponse([]));
    expect(await SolrService.findNearestCity({ lat: 0, lng: -30, lang: "en" })).toBeNull();
  });

  it("asks the /cities handler with the nearest-place query", async () => {
    stubFetch(makeSolrResponse([]));
    await SolrService.findNearestCity({ lat: 41.9, lng: 12.5, lang: "en" });
    const url = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(url).toContain("/solr/cities/cities?");
    expect(new URL(url).searchParams.get("sort")).toMatch(/^hsin\(/);
  });

  it("throws on an outage, rather than answering no place", async () => {
    stubFetch({}, false);
    await expect(
      SolrService.findNearestCity({ lat: 41.9, lng: 12.5, lang: "en" }),
    ).rejects.toThrow();
  });
});
