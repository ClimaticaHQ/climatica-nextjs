import {
  ALL_MONTHS,
  FILTER_VIEW_BY_ROUTE,
  CELL_SIZES,
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  CLIMATE_VARIABLES,
  DATASETS,
  FALLBACK_GRID_SIZE,
  FILTER_CHIP_AVAILABILITIES,
  FILTER_DEFAULTS,
  FILTER_ORDER,
  FILTER_UNAVAILABLE_LAYOUTS,
  FILTER_WEATHER_PERIODS_LIMITS,
  FILTERS_CONFIG,
  FULL_VARIABLES_CLIMATE_PERIOD,
  MONTH_NUMBERS,
  PERIOD_RESTRICTED_VARIABLES,
  WEATHER_VARIABLES,
} from "@/constants";
import { EFilterAvailability, EFilterKey, EFilterPlacement, EFilterView } from "@/enums";
import type {
  TCellSize,
  TClimatePeriod,
  TDataset,
  TFilterAvailabilityContext,
  TFilterOptionContext,
  TFilters,
  TFilterUnavailabilityChecks,
  TFilterUnavailableReason,
  TMonthFilter,
  TVariable,
} from "@/types";
import { weatherYearSchema } from "@/validators";
import { FILTER_CODECS } from "./filterCodecs.util";
import { disableOtherSide } from "./pair.util";

const RESTRICTED_VARIABLES = new Set<TVariable>(PERIOD_RESTRICTED_VARIABLES);

// * what makes each unavailability reason apply in a view
const UNAVAILABILITY_CHECKS: TFilterUnavailabilityChecks = {
  [EFilterAvailability.WALTER_LIETH]: ({ isWalterLieth }) => isWalterLieth,
  [EFilterAvailability.HEAT_MAP]: ({ view }) => view === EFilterView.HEAT_MAP,
};

/** The filter view a route shows, or null on a page without filters. */
export function getFilterView(pathname: string): EFilterView | null {
  const match = Object.entries(FILTER_VIEW_BY_ROUTE).find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return match?.[1] ?? null;
}

/** Whether the filter means anything with this dataset (a climate period doesn't with Weather). */
export function isFilterRelevant(key: EFilterKey, dataset: TDataset) {
  const filterDataset = FILTERS_CONFIG[key].dataset;
  return filterDataset === undefined || filterDataset === dataset;
}

/** Whether the dataset and period carry this variable at all. */
export function isVariableOffered(
  variable: TVariable,
  { dataset, climatePeriod }: Omit<TFilterOptionContext, "view">,
) {
  if (dataset === DATASETS.WEATHER) {
    return WEATHER_VARIABLES.some((weatherVariable) => weatherVariable === variable);
  }
  return climatePeriod === FULL_VARIABLES_CLIMATE_PERIOD || !RESTRICTED_VARIABLES.has(variable);
}

/** The variable chips to render: Weather has only its three. */
export function getVariableOptions(dataset: TDataset): readonly TVariable[] {
  return dataset === DATASETS.WEATHER ? WEATHER_VARIABLES : CLIMATE_VARIABLES;
}

/** A rendered variable that can't be picked here — the heat map lacks the restricted ones too. */
export function isVariableOptionDisabled(variable: TVariable, context: TFilterOptionContext) {
  const isHeatMapRestricted =
    context.view === EFilterView.HEAT_MAP &&
    context.dataset === DATASETS.CLIMATE &&
    RESTRICTED_VARIABLES.has(variable);
  return isHeatMapRestricted || !isVariableOffered(variable, context);
}

/** The 30s grid exists only for the full-variables climate normals. */
export function isGridSizeOffered(
  gridSize: TCellSize,
  { dataset, climatePeriod }: Omit<TFilterOptionContext, "view">,
) {
  if (gridSize !== CELL_SIZES.THIRTY_SECONDS) return true;
  return dataset === DATASETS.CLIMATE && climatePeriod === FULL_VARIABLES_CLIMATE_PERIOD;
}

/** Months in calendar order, without duplicates; none or all twelve is "all". */
export function normalizeMonths(months: TMonthFilter): TMonthFilter {
  if (months === ALL_MONTHS) return months;
  const picked = MONTH_NUMBERS.filter((month) => months.includes(month));
  return picked.length === 0 || picked.length === MONTH_NUMBERS.length ? ALL_MONTHS : picked;
}

// * the empty fallback only guards hand-edited URLs: the UI never lets the last variable go
function normalizeVariables(filters: TFilters) {
  const picked = CLIMATE_VARIABLES.filter(
    (variable) => filters.variables.includes(variable) && isVariableOffered(variable, filters),
  );
  return picked.length > 0 ? picked : [...FILTER_DEFAULTS[EFilterKey.VARIABLES]];
}

// * the too-few fallback only guards hand-edited URLs: the years editor never goes below the minimum
function normalizeWeatherPeriods(periods: readonly number[]) {
  const unique = [...new Set(periods)].slice(0, FILTER_WEATHER_PERIODS_LIMITS.MAX);
  return unique.length >= FILTER_WEATHER_PERIODS_LIMITS.MIN
    ? unique
    : [...FILTER_DEFAULTS[EFilterKey.WEATHER_PERIODS]];
}

/**
 * Makes a filter set consistent: drops variables and the 30s grid the dataset/period lack
 * (none left = the default variables), orders months, dedupes years, and never compares a
 * climate period with itself.
 */
export function normalizeFilters(filters: TFilters): TFilters {
  const arePeriodsEqual = filters.climatePeriodA === filters.climatePeriodB;
  return {
    ...filters,
    variables: normalizeVariables(filters),
    gridSize: isGridSizeOffered(filters.gridSize, filters) ? filters.gridSize : FALLBACK_GRID_SIZE,
    months: normalizeMonths(filters.months),
    climatePeriodA: arePeriodsEqual
      ? FILTER_DEFAULTS[EFilterKey.CLIMATE_PERIOD_A]
      : filters.climatePeriodA,
    climatePeriodB: arePeriodsEqual
      ? FILTER_DEFAULTS[EFilterKey.CLIMATE_PERIOD_B]
      : filters.climatePeriodB,
    weatherPeriods: normalizeWeatherPeriods(filters.weatherPeriods),
  };
}

export function isFilterDefault<K extends EFilterKey>(key: K, value: TFilters[K]) {
  const codec = FILTER_CODECS[key];
  return codec.encode(value) === codec.encode(FILTERS_CONFIG[key].defaultValue);
}

/** Hidden (not part of this view or dataset), disabled with a reason, or available. */
export function getFilterAvailability(key: EFilterKey, context: TFilterAvailabilityContext) {
  const config = FILTERS_CONFIG[key];
  if (!config.views.includes(context.view) || !isFilterRelevant(key, context.dataset)) {
    return EFilterAvailability.HIDDEN;
  }
  const reason = config.unavailableWhen?.find((candidate) =>
    UNAVAILABILITY_CHECKS[candidate](context),
  );
  return reason ?? EFilterAvailability.AVAILABLE;
}

/** The full sheet's sections (and the chips'), in order — disabled ones included, Compare Periods' periods and years not. */
export function getSectionFilterKeys(context: TFilterAvailabilityContext) {
  return FILTER_ORDER.filter(
    (key) =>
      FILTERS_CONFIG[key].placement === EFilterPlacement.SECTION &&
      getFilterAvailability(key, context) !== EFilterAvailability.HIDDEN,
  );
}

/**
 * The desktop sidebar's sections, in order: the sections, plus Compare Periods' periods or
 * years (on the page below lg) — after Dataset, as FILTER_ORDER puts them.
 */
export function getSidebarFilterKeys(context: TFilterAvailabilityContext) {
  return FILTER_ORDER.filter(
    (key) => getFilterAvailability(key, context) !== EFilterAvailability.HIDDEN,
  );
}

/** Mobile chips, in order — see FILTER_CHIP_AVAILABILITIES for which. */
export function getChipFilterKeys(context: TFilterAvailabilityContext) {
  return getSectionFilterKeys(context).filter((key) =>
    FILTER_CHIP_AVAILABILITIES.includes(getFilterAvailability(key, context)),
  );
}

/** The "all filters" badge: changeable chip filters whose value isn't the default. */
export function countChangedFilters(filters: TFilters, context: TFilterAvailabilityContext) {
  return getChipFilterKeys(context).filter(
    (key) =>
      getFilterAvailability(key, context) === EFilterAvailability.AVAILABLE &&
      !isFilterDefault(key, filters[key]),
  ).length;
}

/** The filters with one value replaced. */
export function setFilterValue<K extends EFilterKey>(
  filters: TFilters,
  key: K,
  value: TFilters[K],
): TFilters {
  const next = { ...filters };
  next[key] = value;
  return next;
}

/** A multi-choice list with the option added, or removed when it's there. */
export function toggleFilterOption<T>(selected: readonly T[], option: T): T[] {
  return selected.includes(option)
    ? selected.filter((item) => item !== option)
    : [...selected, option];
}

/** Whether an availability is a reason a filter is disabled (not available, not hidden). */
export function isFilterUnavailableReason(
  availability: EFilterAvailability,
): availability is TFilterUnavailableReason {
  return availability in FILTER_UNAVAILABLE_LAYOUTS;
}

/** How a section disabled for this reason looks, or null when it isn't disabled. */
export function getFilterUnavailableLayout(availability: EFilterAvailability) {
  return isFilterUnavailableReason(availability) ? FILTER_UNAVAILABLE_LAYOUTS[availability] : null;
}

/** Whether a section's controls are disabled — a dimmed section ignores input as a whole. */
export function areFilterControlsDisabled(availability: EFilterAvailability) {
  const layout = getFilterUnavailableLayout(availability);
  return layout !== null && !layout.isDimmed;
}

/** The translation key of what's wrong with a typed weather year, or null when it's valid. */
export function getWeatherYearError(year: number) {
  const result = weatherYearSchema.safeParse(year);
  return result.success ? null : (result.error.issues[0]?.message ?? null);
}

/** The climate period a dropdown value names, or undefined for anything else. */
export function findClimatePeriod(value: string): TClimatePeriod | undefined {
  return Object.values(CLIMATE_PERIODS).find((period) => period === value);
}

/** A dropdown's change handler that passes on only values naming a climate period. */
export function toClimatePeriodHandler(onChange: (period: TClimatePeriod) => void) {
  return (value: string) => {
    const period = findClimatePeriod(value);
    if (period !== undefined) onChange(period);
  };
}

/**
 * Climate period dropdown options; null availability = unknown yet, so none is disabled for
 * it. excludedPeriod — the one picked on the other side of a comparison — is disabled too.
 */
export function getClimatePeriodOptions(
  availablePeriods: readonly TClimatePeriod[] | null,
  excludedPeriod?: TClimatePeriod,
) {
  const options = Object.values(CLIMATE_PERIODS).map((period) => ({
    value: period,
    label: CLIMATE_PERIOD_LABELS[period],
    disabled: availablePeriods !== null && !availablePeriods.includes(period),
  }));
  return excludedPeriod === undefined ? options : disableOtherSide(options, excludedPeriod);
}

/** The translation key of why a year can't join the compared years, or null when it can. */
export function getAddedWeatherPeriodError(year: number | undefined, periods: readonly number[]) {
  if (year === undefined || getWeatherYearError(year) !== null) {
    return "comparePeriods.weather.invalidYear";
  }
  return periods.includes(year) ? "comparePeriods.weather.duplicateYear" : null;
}
