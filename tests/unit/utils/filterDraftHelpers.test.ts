import { CLIMATE_PERIODS, FILTER_DEFAULTS, WEATHER_MAX_YEAR } from "@/constants";
import { EFilterAvailability, EFilterKey } from "@/enums";
import { parseBboxParams } from "@/utils/bbox.util";
import {
  areFilterControlsDisabled,
  getAddedWeatherPeriodError,
  getClimatePeriodOptions,
  setFilterValue,
  toggleFilterOption,
} from "@/utils/filters.util";
import { areFiltersEqual } from "@/utils/filtersUrl.util";
import { describe, expect, it } from "vitest";

describe("filter draft helpers", () => {
  it("setFilterValue replaces one value without touching the source", () => {
    const next = setFilterValue(FILTER_DEFAULTS, EFilterKey.MONTHS, [4]);
    expect(next.months).toEqual([4]);
    expect(FILTER_DEFAULTS.months).toBe("all");
  });

  it("toggleFilterOption adds a missing option and removes a present one", () => {
    expect(toggleFilterOption([1, 2], 3)).toEqual([1, 2, 3]);
    expect(toggleFilterOption([1, 2], 2)).toEqual([1]);
  });

  it("areFiltersEqual compares what the URL would carry", () => {
    const withYear = setFilterValue(FILTER_DEFAULTS, EFilterKey.WEATHER_YEAR, 1990);
    // * the year means nothing with the Climate dataset
    expect(areFiltersEqual(FILTER_DEFAULTS, withYear)).toBe(true);
    const weather = setFilterValue(withYear, EFilterKey.DATASET, "weather");
    expect(areFiltersEqual(FILTER_DEFAULTS, weather)).toBe(false);
  });

  it("areFilterControlsDisabled: Walter-Lieth disables controls, the heat map dims instead", () => {
    expect(areFilterControlsDisabled(EFilterAvailability.AVAILABLE)).toBe(false);
    expect(areFilterControlsDisabled(EFilterAvailability.WALTER_LIETH)).toBe(true);
    expect(areFilterControlsDisabled(EFilterAvailability.HEAT_MAP)).toBe(false);
  });

  it("getAddedWeatherPeriodError rejects missing, out-of-range and duplicate years", () => {
    expect(getAddedWeatherPeriodError(undefined, [2000])).toBe(
      "comparePeriods.weather.invalidYear",
    );
    expect(getAddedWeatherPeriodError(WEATHER_MAX_YEAR + 1, [2000])).toBe(
      "comparePeriods.weather.invalidYear",
    );
    expect(getAddedWeatherPeriodError(2000, [2000])).toBe("comparePeriods.weather.duplicateYear");
    expect(getAddedWeatherPeriodError(2001, [2000])).toBeNull();
  });

  it("getClimatePeriodOptions disables periods without data, none while unknown", () => {
    expect(getClimatePeriodOptions(null).some(({ disabled }) => disabled)).toBe(false);
    const options = getClimatePeriodOptions([CLIMATE_PERIODS.C1970_2000]);
    expect(options.filter(({ disabled }) => !disabled).map(({ value }) => value)).toEqual([
      CLIMATE_PERIODS.C1970_2000,
    ]);
  });

  it("parseBboxParams needs all four edges", () => {
    const params = new URLSearchParams("north=50&south=40&west=0&east=10");
    expect(parseBboxParams(params)).toEqual({ north: 50, south: 40, west: 0, east: 10 });
    params.delete("east");
    expect(parseBboxParams(params)).toBeNull();
  });
});
