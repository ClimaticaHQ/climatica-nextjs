import { FILTER_DEFAULTS } from "@/constants";
import { EFilterKey, EFilterView } from "@/enums";
import type { TFilters } from "@/types";
import { getFilterChips } from "@/utils/filterChips.util";
import {
  countChangedFilters,
  getDefaultGridSize,
  getGridSizeByPeriod,
  getGridSizeOptionStates,
  normalizeFilters,
  resolveGridSize,
} from "@/utils/filters.util";
import { parseFilters, restoreDatasetSelection, serializeFilters } from "@/utils/filtersUrl.util";
import { getFinestGridSizeBeyondFullPeriod } from "@/utils/info.util";
import { describe, expect, it } from "vitest";

const filtersWith = (overrides: Partial<TFilters>): TFilters => ({
  ...FILTER_DEFAULTS,
  ...overrides,
});

const { CLIMATE_STATISTICS, COMPARE_CITIES, COMPARE_PERIODS, HEAT_MAP } = EFilterView;
const OTHER_NORMALS = ["c1951-1980", "c1961-1990", "c1981-2010", "c1991-2020"] as const;

describe("the default resolution: the finest offered for what the view shows", () => {
  it.each([CLIMATE_STATISTICS, COMPARE_CITIES])("%s: 30″ for 1970–2000", (view) => {
    expect(getDefaultGridSize(filtersWith({ climatePeriod: "c1970-2000" }), view)).toBe("30s");
  });

  it.each(OTHER_NORMALS)("2.5′ for the %s normals", (climatePeriod) => {
    expect(getDefaultGridSize(filtersWith({ climatePeriod }), CLIMATE_STATISTICS)).toBe("2.5m");
    expect(getDefaultGridSize(filtersWith({ climatePeriod }), COMPARE_CITIES)).toBe("2.5m");
  });

  it("2.5′ for weather years, whatever the climate period left in the URL", () => {
    const weather = filtersWith({ dataset: "weather", climatePeriod: "c1970-2000" });
    expect(getDefaultGridSize(weather, CLIMATE_STATISTICS)).toBe("2.5m");
    expect(getDefaultGridSize(weather, COMPARE_PERIODS)).toBe("2.5m");
  });

  it("Compare Periods: the finest offered for both periods — 1970–2000 with another is 2.5′", () => {
    const mixed = filtersWith({ climatePeriodA: "c1970-2000", climatePeriodB: "c1991-2020" });
    expect(getDefaultGridSize(mixed, COMPARE_PERIODS)).toBe("2.5m");
    const swapped = filtersWith({ climatePeriodA: "c1991-2020", climatePeriodB: "c1970-2000" });
    expect(getDefaultGridSize(swapped, COMPARE_PERIODS)).toBe("2.5m");
    expect(getDefaultGridSize({ ...mixed, climatePeriod: "c1970-2000" }, COMPARE_PERIODS)).toBe(
      "2.5m",
    );
  });

  it("the heat map keeps 2.5′, even for 1970–2000", () => {
    expect(getDefaultGridSize(filtersWith({ climatePeriod: "c1970-2000" }), HEAT_MAP)).toBe("2.5m");
  });

  it("the guide's fallback: the finest the other normals and the weather years offer", () => {
    expect(getFinestGridSizeBeyondFullPeriod()).toBe("2.5m");
  });
});

describe("none chosen vs a choice", () => {
  it("none chosen follows every period change: 30″ → 2.5′ → 30″", () => {
    const steps = ["c1970-2000", "c1991-2020", "c1970-2000"] as const;
    const resolved = steps.map((climatePeriod) =>
      resolveGridSize(normalizeFilters(filtersWith({ climatePeriod })), CLIMATE_STATISTICS),
    );
    expect(resolved).toEqual(["30s", "2.5m", "30s"]);
  });

  it("a choice is kept across period changes — a coarser one too", () => {
    for (const gridSize of ["10m", "2.5m"] as const) {
      for (const climatePeriod of ["c1970-2000", "c1991-2020"] as const) {
        const filters = normalizeFilters(filtersWith({ gridSize, climatePeriod }));
        expect(filters.gridSize).toBe(gridSize);
        expect(resolveGridSize(filters, CLIMATE_STATISTICS)).toBe(gridSize);
      }
    }
  });

  it("a choice the new period lacks falls back to its finest, as none chosen again", () => {
    const changed = normalizeFilters(filtersWith({ gridSize: "30s", climatePeriod: "c1991-2020" }));
    expect(changed.gridSize).toBeNull();
    expect(resolveGridSize(changed, CLIMATE_STATISTICS)).toBe("2.5m");
    const back = normalizeFilters({ ...changed, climatePeriod: "c1970-2000" });
    expect(resolveGridSize(back, CLIMATE_STATISTICS)).toBe("30s");
  });

  it("a choice another page doesn't offer: the page shows its finest, the choice stays", () => {
    const filters = filtersWith({ gridSize: "30s", climatePeriod: "c1970-2000" });
    expect(resolveGridSize(filters, COMPARE_PERIODS)).toBe("2.5m");
    expect(serializeFilters(filters).get("grid")).toBe("30s");
    expect(resolveGridSize(filters, CLIMATE_STATISTICS)).toBe("30s");
  });

  it("Compare Periods never offers 30″ for a pair, whatever the single period", () => {
    const states = getGridSizeOptionStates(
      filtersWith({ climatePeriod: "c1970-2000" }),
      COMPARE_PERIODS,
    );
    expect(states.find(({ value }) => value === "30s")?.isDisabled).toBe(true);
    const single = getGridSizeOptionStates(
      filtersWith({ climatePeriod: "c1970-2000" }),
      CLIMATE_STATISTICS,
    );
    expect(single.every(({ isDisabled }) => !isDisabled)).toBe(true);
  });
});

describe("the URL: `grid` only for a choice", () => {
  it("no grid param is none chosen; a grid param is a choice, the default's value too", () => {
    expect(parseFilters(new URLSearchParams("")).gridSize).toBeNull();
    expect(parseFilters(new URLSearchParams("grid=2.5m")).gridSize).toBe("2.5m");
    expect(parseFilters(new URLSearchParams("grid=30s")).gridSize).toBe("30s");
  });

  it("writes none chosen as no param, and a choice even where it equals the default", () => {
    expect(serializeFilters(filtersWith({})).has("grid")).toBe(false);
    expect(
      serializeFilters(filtersWith({ gridSize: "2.5m", climatePeriod: "c1991-2020" })).get("grid"),
    ).toBe("2.5m");
    expect(serializeFilters(filtersWith({ gridSize: "30s" })).get("grid")).toBe("30s");
  });
});

describe("the dataset switch brings a chosen 30″ back", () => {
  it("Climate 30″ → Weather (none chosen) → Climate restores 30″", () => {
    const climate = filtersWith({ gridSize: "30s" });
    const weather = normalizeFilters({ ...climate, dataset: "weather" });
    expect(weather.gridSize).toBeNull();
    const back = restoreDatasetSelection({
      next: normalizeFilters({ ...weather, dataset: "climate" }),
      previousDataset: "weather",
      applied: weather,
      selections: { climate },
    });
    expect(back.gridSize).toBe("30s");
  });
});

describe("the grid each period would load at", () => {
  const byPeriod = (filters: TFilters, view: EFilterView) =>
    Object.fromEntries(
      getGridSizeByPeriod(filters, view).map((e) => [e.climatePeriod, e.gridSize]),
    );

  it("none chosen: 1970–2000 at 30″, the others at 2.5′", () => {
    expect(byPeriod(filtersWith({}), CLIMATE_STATISTICS)).toEqual({
      "c1951-1980": "2.5m",
      "c1961-1990": "2.5m",
      "c1970-2000": "30s",
      "c1981-2010": "2.5m",
      "c1991-2020": "2.5m",
    });
  });

  it("a choice: every period at it, where offered", () => {
    expect(
      new Set(Object.values(byPeriod(filtersWith({ gridSize: "10m" }), CLIMATE_STATISTICS))),
    ).toEqual(new Set(["10m"]));
  });

  it("Compare Periods: every period at the pair's grid", () => {
    expect(new Set(Object.values(byPeriod(filtersWith({}), COMPARE_PERIODS)))).toEqual(
      new Set(["2.5m"]),
    );
  });
});

describe("chips and the badge", () => {
  const context = { view: CLIMATE_STATISTICS, dataset: "climate" as const, isWalterLieth: false };
  const t = (key: string) => key;

  it("the chip shows the grid the view loads, unchanged while none was chosen", () => {
    const [chip] = getFilterChips(filtersWith({}), context, t).filter(
      ({ key }) => key === EFilterKey.GRID_SIZE,
    );
    expect(chip).toMatchObject({ value: "cellSizesShort.30s", isChanged: false });
    expect(countChangedFilters(filtersWith({}), context)).toBe(0);
  });

  it("a choice counts as changed", () => {
    expect(countChangedFilters(filtersWith({ gridSize: "10m" }), context)).toBe(1);
  });
});
