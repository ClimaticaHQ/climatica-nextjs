import { COMPARE_PERIODS_URL_SCHEMA } from "@/app/compare-periods/_components/ComparePeriods.constant";
import { FILTER_DEFAULTS } from "@/constants";
import { parseFilters } from "@/utils/filtersUrl.util";
import { parseUrlState } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

const LVIV = {
  id: "url:49.8397,24.0297",
  label: "Lviv",
  description: "",
  lat: 49.8397,
  lng: 24.0297,
};

describe("compare-periods URL", () => {
  it("parses an existing climate-mode exported link", () => {
    const params = new URLSearchParams(
      "city=Lviv&lat=49.8397&lng=24.0297&dataset=climate&var=tmax%2Ctmin%2Cprec&grid=10m&months=all&period1=c1970-2000&period2=c1991-2020",
    );
    expect(parseUrlState(COMPARE_PERIODS_URL_SCHEMA, params)).toEqual({ city: LVIV });
    expect(parseFilters(params)).toEqual({ ...FILTER_DEFAULTS, gridSize: "10m" });
  });

  it("parses an existing weather-mode exported link (comma-joined periods)", () => {
    const params = new URLSearchParams(
      "city=Lviv&lat=49.8397&lng=24.0297&dataset=weather&var=tmax%2Ctmin%2Cprec&grid=10m&months=all&periods=2018%2C2020",
    );
    expect(parseUrlState(COMPARE_PERIODS_URL_SCHEMA, params)).toEqual({ city: LVIV });
    expect(parseFilters(params)).toEqual({
      ...FILTER_DEFAULTS,
      dataset: "weather",
      gridSize: "10m",
      weatherPeriods: [2018, 2020],
    });
  });

  it("falls back to legacy year1/year2 when periods is absent", () => {
    const params = new URLSearchParams(
      "city=Lviv&lat=49.8397&lng=24.0297&dataset=weather&var=tmax%2Ctmin%2Cprec&grid=10m&months=all&year1=2018&year2=2020",
    );
    expect(parseFilters(params).weatherPeriods).toEqual([2018, 2020]);
  });
});
