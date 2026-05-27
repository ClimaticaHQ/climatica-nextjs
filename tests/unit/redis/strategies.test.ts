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

describe("REDIS_STRATEGIES.climateData", () => {
  describe("buildKey", () => {
    it("includes dataset, resolution, and lat/lng with 4 decimal places", () => {
      const key = REDIS_STRATEGIES.climateData.buildKey({
        dataset: "climate",
        resolution: "10m",
        lat: 48.1234,
        lng: 16.5432,
      });
      expect(key).toContain("climate");
      expect(key).toContain("10m");
      expect(key).toContain("48.1234");
      expect(key).toContain("16.5432");
    });
  });

  describe("TTLs", () => {
    it("popularTtl is greater than ttl", () => {
      expect(REDIS_STRATEGIES.climateData.popularTtl).toBeGreaterThan(
        REDIS_STRATEGIES.climateData.ttl,
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
