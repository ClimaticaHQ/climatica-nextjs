import { CLIMATE_PERIODS, FILTER_DEFAULTS } from "@/constants";
import { parseFilters, serializeFilters } from "@/utils/filtersUrl.util";
import { describe, expect, it } from "vitest";

describe("period1 / period2 URL round-trip", () => {
  it("reads both periods from period1 and period2", () => {
    const filters = parseFilters(new URLSearchParams("period1=c1961-1990&period2=c1981-2010"));
    expect(filters.climatePeriodA).toBe(CLIMATE_PERIODS.C1961_1990);
    expect(filters.climatePeriodB).toBe(CLIMATE_PERIODS.C1981_2010);
  });

  it("writes them back as period1 and period2, unchanged", () => {
    const params = new URLSearchParams("period1=c1961-1990&period2=c1981-2010");
    expect(serializeFilters(parseFilters(params)).toString()).toBe(params.toString());
  });

  it("a swap writes the periods the other way round", () => {
    const filters = {
      ...FILTER_DEFAULTS,
      climatePeriodA: CLIMATE_PERIODS.C1991_2020,
      climatePeriodB: CLIMATE_PERIODS.C1970_2000,
    };
    const params = serializeFilters(filters);
    expect(params.get("period1")).toBe(CLIMATE_PERIODS.C1991_2020);
    expect(params.get("period2")).toBe(CLIMATE_PERIODS.C1970_2000);
    expect(parseFilters(params)).toMatchObject({
      climatePeriodA: CLIMATE_PERIODS.C1991_2020,
      climatePeriodB: CLIMATE_PERIODS.C1970_2000,
    });
  });

  it("leaves the defaults out of the URL", () => {
    expect(serializeFilters(FILTER_DEFAULTS).has("period1")).toBe(false);
    expect(serializeFilters(FILTER_DEFAULTS).has("period2")).toBe(false);
  });

  it("never compares a period with itself: equal periods fall back to the defaults", () => {
    const filters = parseFilters(new URLSearchParams("period1=c1961-1990&period2=c1961-1990"));
    expect(filters.climatePeriodA).toBe(FILTER_DEFAULTS.climatePeriodA);
    expect(filters.climatePeriodB).toBe(FILTER_DEFAULTS.climatePeriodB);
  });
});
