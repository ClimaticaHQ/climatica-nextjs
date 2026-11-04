import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { REDIS_STRATEGIES } from "@/libs/redis/strategies";

describe("REDIS_STRATEGIES.citySearch", () => {
  describe("buildEntry", () => {
    it('keys { query: "rome", lang: "en" } as "city-search:en:rome"', () => {
      expect(REDIS_STRATEGIES.citySearch.buildEntry({ query: "rome", lang: "en" }).key).toBe(
        "city-search:en:rome",
      );
    });

    it("lowercases and trims the query", () => {
      expect(REDIS_STRATEGIES.citySearch.buildEntry({ query: "  ROME  ", lang: "en" }).key).toBe(
        "city-search:en:rome",
      );
    });

    it('counts lookups under "city-search-counter:en:rome", with the strategy\'s TTLs', () => {
      expect(REDIS_STRATEGIES.citySearch.buildEntry({ query: "rome", lang: "en" })).toMatchObject({
        counterKey: "city-search-counter:en:rome",
        ttl: REDIS_STRATEGIES.citySearch.ttl,
        popularTtl: REDIS_STRATEGIES.citySearch.popularTtl,
        popularThreshold: REDIS_STRATEGIES.citySearch.popularThreshold,
      });
    });
  });

  describe("TTLs", () => {
    it("ttl is a positive number", () => {
      expect(REDIS_STRATEGIES.citySearch.ttl).toBeGreaterThan(0);
    });

    it("shortTtl is less than ttl", () => {
      expect(REDIS_STRATEGIES.citySearch.shortTtl).toBeLessThan(REDIS_STRATEGIES.citySearch.ttl);
    });

    it("popularTtl is greater than ttl", () => {
      expect(REDIS_STRATEGIES.citySearch.popularTtl).toBeGreaterThan(
        REDIS_STRATEGIES.citySearch.ttl,
      );
    });
  });
});

describe("REDIS_STRATEGIES.worldclimResource", () => {
  describe("buildEntry", () => {
    it("keys the cache and the counter by the resource's search params, apart", () => {
      const params = "id=Cell&iri=http%3A%2F%2Fexample.com%2FCell";
      const { key, counterKey } = REDIS_STRATEGIES.worldclimResource.buildEntry(params);
      expect(key).toContain(params);
      expect(counterKey).toContain(params);
      expect(key).not.toBe(counterKey);
    });
  });

  describe("TTLs", () => {
    it("popularTtl is greater than ttl", () => {
      expect(REDIS_STRATEGIES.worldclimResource.popularTtl).toBeGreaterThan(
        REDIS_STRATEGIES.worldclimResource.ttl,
      );
    });
  });
});

describe("REDIS_STRATEGIES.nearestCity", () => {
  describe("buildKey", () => {
    it("includes the language and lat/lng with 4 decimal places", () => {
      const key = REDIS_STRATEGIES.nearestCity.buildKey({
        lat: 51.50001,
        lng: -0.12345,
        lang: "uk",
      });
      expect(key).toBe("nearest-city:uk:51.5000:-0.1235");
    });
  });
});
