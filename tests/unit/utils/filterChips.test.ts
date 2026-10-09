import { CLIMATE_PERIODS, FILTER_DEFAULTS } from "@/constants";
import { EFilterKey, EFilterView } from "@/enums";
import en from "@/i18n/locales/en.json";
import uk from "@/i18n/locales/uk.json";
import type { TFilterAvailabilityContext, TFilters, TTranslate } from "@/types";
import {
  getFilterChipAriaLabel,
  getFilterChips,
  getFilterChipValue,
} from "@/utils/filterChips.util";
import { createTranslator, type Messages } from "next-intl";
import { describe, expect, it } from "vitest";

const tEn: TTranslate = createTranslator<Messages>({ locale: "en", messages: en });
const tUk: TTranslate = createTranslator<Messages>({ locale: "uk", messages: uk });

function filtersWith(overrides: Partial<TFilters>): TFilters {
  return { ...FILTER_DEFAULTS, ...overrides };
}

function context(overrides: Partial<TFilterAvailabilityContext>): TFilterAvailabilityContext {
  return {
    view: EFilterView.CLIMATE_STATISTICS,
    dataset: "climate",
    isWalterLieth: false,
    ...overrides,
  };
}

const value = (key: EFilterKey, overrides: Partial<TFilters>, t = tEn) =>
  getFilterChipValue(key, filtersWith(overrides), t);

describe("chip values", () => {
  it("variables: the first one, then how many more", () => {
    expect(value(EFilterKey.VARIABLES, { variables: ["tmax"] })).toBe("Max temp");
    expect(value(EFilterKey.VARIABLES, { variables: ["tmax", "tmin", "prec"] })).toBe(
      "Max temp +2",
    );
  });

  it("months: all, one month's name, or a count", () => {
    expect(value(EFilterKey.MONTHS, { months: "all" })).toBe("All months");
    expect(value(EFilterKey.MONTHS, { months: [7] })).toBe("Jul");
    expect(value(EFilterKey.MONTHS, { months: [1, 2, 3] })).toBe("3 months");
  });

  it("months: the count uses the locale's plural forms", () => {
    expect(value(EFilterKey.MONTHS, { months: [1, 2] }, tUk)).toBe("2 місяці");
    expect(value(EFilterKey.MONTHS, { months: [1, 2, 3, 4, 5] }, tUk)).toBe("5 місяців");
    expect(value(EFilterKey.MONTHS, { months: "all" }, tUk)).toBe("Усі місяці");
  });

  it("dataset, period, year and resolution read short", () => {
    expect(value(EFilterKey.DATASET, { dataset: "weather" })).toBe("Weather");
    expect(value(EFilterKey.CLIMATE_PERIOD, { climatePeriod: CLIMATE_PERIODS.C1961_1990 })).toBe(
      "1961–1990",
    );
    expect(value(EFilterKey.WEATHER_YEAR, { weatherYear: 1990 })).toBe("1990");
    expect(value(EFilterKey.GRID_SIZE, { gridSize: "2.5m" })).toBe("2.5 min");
    expect(value(EFilterKey.GRID_SIZE, { gridSize: "2.5m" }, tUk)).toBe("2,5 хв");
  });

  it("the accessible label names the filter, then its value", () => {
    const filters = filtersWith({ climatePeriod: CLIMATE_PERIODS.C1961_1990 });
    expect(getFilterChipAriaLabel(EFilterKey.CLIMATE_PERIOD, filters, tEn)).toBe(
      "Climate period: 1961–1990",
    );
  });
});

describe("chip selection per view", () => {
  const keysFor = (ctx: TFilterAvailabilityContext) =>
    getFilterChips(filtersWith({ dataset: ctx.dataset }), ctx, tEn).map(({ key }) => key);

  it("City Climate, Climate: every section filter, in FILTER_ORDER", () => {
    expect(keysFor(context({}))).toEqual([
      "dataset",
      "climatePeriod",
      "variables",
      "gridSize",
      "months",
    ]);
  });

  it("City Climate, Weather: the year instead of the period", () => {
    expect(keysFor(context({ dataset: "weather" }))).toEqual([
      "dataset",
      "weatherYear",
      "variables",
      "gridSize",
      "months",
    ]);
  });

  it("Walter-Lieth: variables and months stay, disabled, saying why", () => {
    const chips = getFilterChips(
      filtersWith({ months: [7] }),
      context({ isWalterLieth: true }),
      tEn,
    );
    expect(chips.map(({ key }) => key)).toEqual([
      "dataset",
      "climatePeriod",
      "variables",
      "gridSize",
      "months",
    ]);
    const disabled = chips.filter(({ isDisabled }) => isDisabled);
    expect(disabled.map(({ key }) => key)).toEqual(["variables", "months"]);
    expect(disabled[0]?.ariaLabel).toBe("Variables: Not available in Walter-Lieth view");
    // * a disabled filter isn't counted as changed, even when its value isn't the default
    expect(disabled.some(({ isChanged }) => isChanged)).toBe(false);
  });

  it("Heat map: no months", () => {
    expect(keysFor(context({ view: EFilterView.HEAT_MAP }))).toEqual([
      "dataset",
      "climatePeriod",
      "variables",
      "gridSize",
    ]);
  });

  it("Compare Periods: no period or year chips — they're page-placed", () => {
    const view = EFilterView.COMPARE_PERIODS;
    const expected = ["dataset", "variables", "gridSize", "months"];
    expect(keysFor(context({ view }))).toEqual(expected);
    expect(keysFor(context({ view, dataset: "weather" }))).toEqual(expected);
  });

  it("Compare Cities: the same chips as City Climate", () => {
    expect(keysFor(context({ view: EFilterView.COMPARE_CITIES }))).toEqual(keysFor(context({})));
  });

  it("marks the chips whose value isn't the default", () => {
    const chips = getFilterChips(filtersWith({ months: [7] }), context({}), tEn);
    const changed = chips.filter(({ isChanged }) => isChanged).map(({ key }) => key);
    expect(changed).toEqual(["months"]);
  });
});
