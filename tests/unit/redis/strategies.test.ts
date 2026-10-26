import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { REDIS_STRATEGIES } from "@/libs/redis/strategies";

describe("REDIS_STRATEGIES.citySearch", () => {
  describe("buildKey", () => {
    it('returns "city-search:en:rome" for { query: "rome", lang: "en" }', () => {
      expect(REDIS_STRATEGIES.citySearch.buildKey({ query: "rome", lang: "en" })).toBe(
        "city-search:en:rome",
      );
    });

    it("lowercases and trims the query", () => {
      expect(REDIS_STRATEGIES.citySearch.buildKey({ query: "  ROME  ", lang: "en" })).toBe(
        "city-search:en:rome",
      );
    });
  });

  describe("buildCounterKey", () => {
    it('returns "city-search-counter:en:rome"', () => {
      expect(REDIS_STRATEGIES.citySearch.buildCounterKey({ query: "rome", lang: "en" })).toBe(
        "city-search-counter:en:rome",
      );
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
  describe("buildKey / buildCounterKey", () => {
    it("keys the cache and the counter by the resource's search params, apart", () => {
      const params = "id=Cell&iri=http%3A%2F%2Fexample.com%2FCell";
      const key = REDIS_STRATEGIES.worldclimResource.buildKey(params);
      const counterKey = REDIS_STRATEGIES.worldclimResource.buildCounterKey(params);
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
    it("includes lat/lng with 4 decimal places", () => {
      const key = REDIS_STRATEGIES.nearestCity.buildKey({ lat: 51.50001, lng: -0.12345 });
      expect(key).toContain("51.5000");
      expect(key).toContain("-0.1235");
    });
  });
});
