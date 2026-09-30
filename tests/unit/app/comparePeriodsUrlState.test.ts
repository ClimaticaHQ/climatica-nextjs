import { COMPARE_PERIODS_URL_SCHEMA } from "@/app/compare-periods/_components/ComparePeriods.constant";
import { parseUrlState } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

describe("compare-periods URL schema", () => {
  it("parses an existing climate-mode exported link", () => {
    const params = new URLSearchParams(
      "city=Lviv&lat=49.8397&lng=24.0297&dataset=climate&var=tmax%2Ctmin%2Cprec&grid=10m&months=all&period1=c1970-2000&period2=c1991-2020",
    );
    expect(parseUrlState(COMPARE_PERIODS_URL_SCHEMA, params)).toEqual({
      city: {
        id: "url:49.8397,24.0297",
        label: "Lviv",
        description: "",
        lat: 49.8397,
        lng: 24.0297,
      },
      comparePeriods: {
        dataset: "climate",
        climatePeriodA: "c1970-2000",
        climatePeriodB: "c1991-2020",
      },
      variables: ["tmax", "tmin", "prec"],
      gridSize: "10m",
      months: "all",
    });
  });

  it("parses an existing weather-mode exported link (comma-joined periods)", () => {
    const params = new URLSearchParams(
      "city=Lviv&lat=49.8397&lng=24.0297&dataset=weather&var=tmax%2Ctmin%2Cprec&grid=10m&months=all&periods=2018%2C2020",
    );
    expect(parseUrlState(COMPARE_PERIODS_URL_SCHEMA, params)).toEqual({
      city: {
        id: "url:49.8397,24.0297",
        label: "Lviv",
        description: "",
        lat: 49.8397,
        lng: 24.0297,
      },
      comparePeriods: { dataset: "weather", weatherPeriods: [2018, 2020] },
      variables: ["tmax", "tmin", "prec"],
      gridSize: "10m",
      months: "all",
    });
  });

  it("falls back to legacy year1/year2 when periods is absent", () => {
    const params = new URLSearchParams(
      "city=Lviv&lat=49.8397&lng=24.0297&dataset=weather&var=tmax%2Ctmin%2Cprec&grid=10m&months=all&year1=2018&year2=2020",
    );
    expect(parseUrlState(COMPARE_PERIODS_URL_SCHEMA, params).comparePeriods).toEqual({
      dataset: "weather",
      weatherPeriods: [2018, 2020],
    });
  });
});
