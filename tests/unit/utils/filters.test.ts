import { FILTER_DEFAULTS } from "@/constants";
import { EFilterAvailability, EFilterKey, EFilterView } from "@/enums";
import type { TFilterAvailabilityContext, TFilters } from "@/types";
import {
  countChangedFilters,
  getChipFilterKeys,
  getFilterAvailability,
  getFilterView,
  getSectionFilterKeys,
  getSidebarFilterKeys,
  getVariableOptions,
  isFilterDefault,
  isGridSizeOffered,
  isVariableOptionDisabled,
  normalizeFilters,
  normalizeMonths,
} from "@/utils/filters.util";
import { describe, expect, it } from "vitest";

function filtersWith(overrides: Partial<TFilters>): TFilters {
  return { ...FILTER_DEFAULTS, ...overrides };
}

const CLIMATE_STATISTICS: TFilterAvailabilityContext = {
  view: EFilterView.CLIMATE_STATISTICS,
  dataset: "climate",
  isWalterLieth: false,
};

describe("normalizeFilters", () => {
  it("keeps the defaults as they are", () => {
    expect(normalizeFilters(FILTER_DEFAULTS)).toEqual(FILTER_DEFAULTS);
  });

  it("drops variables the Weather dataset lacks, and the 30s grid", () => {
    const result = normalizeFilters(
      filtersWith({ dataset: "weather", variables: ["srad", "prec", "wind"], gridSize: "30s" }),
    );
    expect(result.variables).toEqual(["prec"]);
    expect(result.gridSize).toBe("2.5m");
  });

  it("drops period-restricted variables outside 1970–2000", () => {
    const result = normalizeFilters(
      filtersWith({ climatePeriod: "c1991-2020", variables: ["wind", "tmin"], gridSize: "30s" }),
    );
    expect(result.variables).toEqual(["tmin"]);
    expect(result.gridSize).toBe("2.5m");
  });

  it("keeps restricted variables and the 30s grid for 1970–2000 climate", () => {
    const result = normalizeFilters(filtersWith({ variables: ["wind", "srad"], gridSize: "30s" }));
    expect(result.variables).toEqual(["srad", "wind"]);
    expect(result.gridSize).toBe("30s");
  });

  it("falls back to the default variables when none are left", () => {
    expect(
      normalizeFilters(filtersWith({ dataset: "weather", variables: ["wind"] })).variables,
    ).toEqual(["tmax", "tmin", "prec"]);
    expect(normalizeFilters(filtersWith({ variables: [] })).variables).toEqual([
      "tmax",
      "tmin",
      "prec",
    ]);
  });

  it("orders variables canonically and drops duplicates", () => {
    expect(
      normalizeFilters(filtersWith({ variables: ["prec", "tmax", "prec"] })).variables,
    ).toEqual(["tmax", "prec"]);
  });

  it("resets equal compare periods to the default pair", () => {
    const result = normalizeFilters(
      filtersWith({ climatePeriodA: "c1981-2010", climatePeriodB: "c1981-2010" }),
    );
    expect(result.climatePeriodA).toBe("c1970-2000");
    expect(result.climatePeriodB).toBe("c1991-2020");
  });

  it("keeps different compare periods, in either order", () => {
    const result = normalizeFilters(
      filtersWith({ climatePeriodA: "c1991-2020", climatePeriodB: "c1951-1980" }),
    );
    expect(result.climatePeriodA).toBe("c1991-2020");
    expect(result.climatePeriodB).toBe("c1951-1980");
  });

  it("dedupes weather periods, keeps their order and caps them at five", () => {
    expect(
      normalizeFilters(filtersWith({ weatherPeriods: [2000, 1990, 2000, 1980, 1970, 1960, 1955] }))
        .weatherPeriods,
    ).toEqual([2000, 1990, 1980, 1970, 1960]);
  });

  it("falls back to the default weather periods when fewer than two are left", () => {
    expect(normalizeFilters(filtersWith({ weatherPeriods: [2000, 2000] })).weatherPeriods).toEqual([
      2021, 1967,
    ]);
  });
});

describe("normalizeMonths", () => {
  it("sorts and dedupes a selection", () => {
    expect(normalizeMonths([7, 1, 7])).toEqual([1, 7]);
  });

  it("treats none or all twelve as all", () => {
    expect(normalizeMonths([])).toBe("all");
    expect(normalizeMonths([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1])).toBe("all");
    expect(normalizeMonths("all")).toBe("all");
  });
});

describe("option rules", () => {
  it("offers Weather only its three variables", () => {
    expect(getVariableOptions("weather")).toEqual(["tmax", "tmin", "prec"]);
    expect(getVariableOptions("climate")).toHaveLength(6);
  });

  it("disables restricted variables outside 1970–2000 and on the heat map", () => {
    const context = { view: EFilterView.CLIMATE_STATISTICS, dataset: "climate" } as const;
    expect(isVariableOptionDisabled("wind", { ...context, climatePeriod: "c1970-2000" })).toBe(
      false,
    );
    expect(isVariableOptionDisabled("wind", { ...context, climatePeriod: "c1991-2020" })).toBe(
      true,
    );
    expect(
      isVariableOptionDisabled("wind", {
        ...context,
        view: EFilterView.HEAT_MAP,
        climatePeriod: "c1970-2000",
      }),
    ).toBe(true);
    expect(isVariableOptionDisabled("tmax", { ...context, climatePeriod: "c1991-2020" })).toBe(
      false,
    );
  });

  it("offers the 30s grid only for 1970–2000 climate", () => {
    expect(isGridSizeOffered("30s", { dataset: "climate", climatePeriod: "c1970-2000" })).toBe(
      true,
    );
    expect(isGridSizeOffered("30s", { dataset: "climate", climatePeriod: "c1961-1990" })).toBe(
      false,
    );
    expect(isGridSizeOffered("30s", { dataset: "weather", climatePeriod: "c1970-2000" })).toBe(
      false,
    );
    expect(isGridSizeOffered("10m", { dataset: "weather", climatePeriod: "c1961-1990" })).toBe(
      true,
    );
  });
});

describe("isFilterDefault", () => {
  it("compares values the way the URL writes them", () => {
    expect(isFilterDefault(EFilterKey.VARIABLES, ["tmax", "tmin", "prec"])).toBe(true);
    expect(isFilterDefault(EFilterKey.VARIABLES, ["tmax"])).toBe(false);
    expect(isFilterDefault(EFilterKey.MONTHS, "all")).toBe(true);
    expect(isFilterDefault(EFilterKey.MONTHS, [1])).toBe(false);
    expect(isFilterDefault(EFilterKey.WEATHER_YEAR, 2024)).toBe(true);
  });
});

describe("getFilterAvailability", () => {
  it("hides filters of the other dataset", () => {
    expect(getFilterAvailability(EFilterKey.CLIMATE_PERIOD, CLIMATE_STATISTICS)).toBe(
      EFilterAvailability.AVAILABLE,
    );
    expect(getFilterAvailability(EFilterKey.WEATHER_YEAR, CLIMATE_STATISTICS)).toBe(
      EFilterAvailability.HIDDEN,
    );
  });

  it("hides the single period on Compare Periods and the pair elsewhere", () => {
    const comparePeriods = { ...CLIMATE_STATISTICS, view: EFilterView.COMPARE_PERIODS };
    expect(getFilterAvailability(EFilterKey.CLIMATE_PERIOD, comparePeriods)).toBe(
      EFilterAvailability.HIDDEN,
    );
    expect(getFilterAvailability(EFilterKey.CLIMATE_PERIOD_A, comparePeriods)).toBe(
      EFilterAvailability.AVAILABLE,
    );
    expect(getFilterAvailability(EFilterKey.CLIMATE_PERIOD_A, CLIMATE_STATISTICS)).toBe(
      EFilterAvailability.HIDDEN,
    );
  });

  it("disables variables and months under Walter-Lieth", () => {
    const walterLieth = { ...CLIMATE_STATISTICS, isWalterLieth: true };
    expect(getFilterAvailability(EFilterKey.VARIABLES, walterLieth)).toBe(
      EFilterAvailability.WALTER_LIETH,
    );
    expect(getFilterAvailability(EFilterKey.MONTHS, walterLieth)).toBe(
      EFilterAvailability.WALTER_LIETH,
    );
    expect(getFilterAvailability(EFilterKey.GRID_SIZE, walterLieth)).toBe(
      EFilterAvailability.AVAILABLE,
    );
  });

  it("gives the first matching reason in config order", () => {
    const heatMapWalterLieth = {
      ...CLIMATE_STATISTICS,
      view: EFilterView.HEAT_MAP,
      isWalterLieth: true,
    };
    expect(getFilterAvailability(EFilterKey.MONTHS, heatMapWalterLieth)).toBe(
      EFilterAvailability.HEAT_MAP,
    );
    expect(getFilterAvailability(EFilterKey.VARIABLES, heatMapWalterLieth)).toBe(
      EFilterAvailability.WALTER_LIETH,
    );
  });

  it("disables months on the heat map", () => {
    const heatMap = { ...CLIMATE_STATISTICS, view: EFilterView.HEAT_MAP };
    expect(getFilterAvailability(EFilterKey.MONTHS, heatMap)).toBe(EFilterAvailability.HEAT_MAP);
  });
});

describe("section and chip keys", () => {
  it("lists sections in sidebar order, disabled ones included", () => {
    expect(getSectionFilterKeys({ ...CLIMATE_STATISTICS, isWalterLieth: true })).toEqual([
      EFilterKey.DATASET,
      EFilterKey.CLIMATE_PERIOD,
      EFilterKey.VARIABLES,
      EFilterKey.GRID_SIZE,
      EFilterKey.MONTHS,
    ]);
  });

  it("keeps the filters only Walter-Lieth disables — switching the chart frees them", () => {
    expect(getChipFilterKeys({ ...CLIMATE_STATISTICS, isWalterLieth: true })).toEqual([
      EFilterKey.DATASET,
      EFilterKey.CLIMATE_PERIOD,
      EFilterKey.VARIABLES,
      EFilterKey.GRID_SIZE,
      EFilterKey.MONTHS,
    ]);
  });

  it("leaves the heat map's months out of the chips", () => {
    expect(getChipFilterKeys({ ...CLIMATE_STATISTICS, view: EFilterView.HEAT_MAP })).not.toContain(
      EFilterKey.MONTHS,
    );
  });

  it("never lists the Compare Periods period pickers", () => {
    const weatherPeriods = {
      view: EFilterView.COMPARE_PERIODS,
      dataset: "weather",
      isWalterLieth: false,
    } as const;
    expect(getSectionFilterKeys(weatherPeriods)).toEqual([
      EFilterKey.DATASET,
      EFilterKey.VARIABLES,
      EFilterKey.GRID_SIZE,
      EFilterKey.MONTHS,
    ]);
  });
});

describe("sidebar keys (lg and up)", () => {
  const comparePeriods = (dataset: "climate" | "weather"): TFilterAvailabilityContext => ({
    view: EFilterView.COMPARE_PERIODS,
    dataset,
    isWalterLieth: false,
  });

  it("adds Compare Periods' periods or years right after Dataset, for both datasets", () => {
    expect(getSidebarFilterKeys(comparePeriods("climate"))).toEqual([
      EFilterKey.DATASET,
      EFilterKey.CLIMATE_PERIOD_A,
      EFilterKey.CLIMATE_PERIOD_B,
      EFilterKey.VARIABLES,
      EFilterKey.GRID_SIZE,
      EFilterKey.MONTHS,
    ]);
    expect(getSidebarFilterKeys(comparePeriods("weather"))).toEqual([
      EFilterKey.DATASET,
      EFilterKey.WEATHER_PERIODS,
      EFilterKey.VARIABLES,
      EFilterKey.GRID_SIZE,
      EFilterKey.MONTHS,
    ]);
  });

  it("keeps them out of the full sheet, the chips and the badge", () => {
    for (const dataset of ["climate", "weather"] as const) {
      const keys = [
        ...getSectionFilterKeys(comparePeriods(dataset)),
        ...getChipFilterKeys(comparePeriods(dataset)),
      ];
      expect(keys).not.toContain(EFilterKey.CLIMATE_PERIOD_A);
      expect(keys).not.toContain(EFilterKey.WEATHER_PERIODS);
    }
    const changed = filtersWith({ weatherPeriods: [2001, 2002, 2003], dataset: "weather" });
    expect(countChangedFilters(changed, comparePeriods("weather"))).toBe(1);
  });

  it("is the same as the sheet's anywhere else", () => {
    expect(getSidebarFilterKeys(CLIMATE_STATISTICS)).toEqual(
      getSectionFilterKeys(CLIMATE_STATISTICS),
    );
  });
});

describe("countChangedFilters", () => {
  it("is 0 for the defaults", () => {
    expect(countChangedFilters(FILTER_DEFAULTS, CLIMATE_STATISTICS)).toBe(0);
  });

  it("counts each changed chip filter once", () => {
    const filters = filtersWith({ climatePeriod: "c1991-2020", months: [1, 2], gridSize: "10m" });
    expect(countChangedFilters(filters, CLIMATE_STATISTICS)).toBe(3);
  });

  it("ignores filters disabled in the view", () => {
    const filters = filtersWith({ months: [1, 2] });
    expect(countChangedFilters(filters, { ...CLIMATE_STATISTICS, isWalterLieth: true })).toBe(0);
  });

  it("ignores the Compare Periods period pickers", () => {
    const filters = filtersWith({ climatePeriodA: "c1951-1980", climatePeriodB: "c1961-1990" });
    const context = { ...CLIMATE_STATISTICS, view: EFilterView.COMPARE_PERIODS };
    expect(countChangedFilters(filters, context)).toBe(0);
  });
});

describe("getFilterView", () => {
  it("maps each filter page, and its sub-paths, to its view", () => {
    expect(getFilterView("/climate-statistics")).toBe(EFilterView.CLIMATE_STATISTICS);
    expect(getFilterView("/compare-cities")).toBe(EFilterView.COMPARE_CITIES);
    expect(getFilterView("/compare-periods")).toBe(EFilterView.COMPARE_PERIODS);
    expect(getFilterView("/heat-map/region")).toBe(EFilterView.HEAT_MAP);
  });

  it("is null on pages without filters", () => {
    expect(getFilterView("/")).toBeNull();
    expect(getFilterView("/heat-mapper")).toBeNull();
  });
});
