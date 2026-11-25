import {
  ALL_MONTHS,
  FILTER_VIEW_BY_ROUTE,
  CELL_SIZES,
  CLIMATE_PERIOD_LABELS,
  CLIMATE_PERIODS,
  CLIMATE_VARIABLES,
  ALWAYS_OFFERED_GRID_SIZE,
  DATASETS,
  FILTER_CHIP_AVAILABILITIES,
  FILTER_DEFAULTS,
  FILTER_ORDER,
  FILTER_UNAVAILABLE_LAYOUTS,
  FILTER_WEATHER_PERIODS_LIMITS,
  FILTERS_CONFIG,
  FULL_VARIABLES_CLIMATE_PERIOD,
  GRID_SIZE_VIEW_DEFAULTS,
  GRIDS_FINEST_FIRST,
  MONTH_NUMBERS,
  PERIOD_RESTRICTED_VARIABLES,
  VARIABLES_NOTE_RULES,
  WEATHER_VARIABLES,
} from "@/constants";
import {
  EFilterAvailability,
  EFilterChoice,
  EFilterKey,
  EFilterPlacement,
  EFilterView,
} from "@/enums";
import type {
  TCellSize,
  TClimatePeriod,
  TDataset,
  TFilterAvailabilityContext,
  TFilterOptionContext,
  TFilters,
  TGridSizeContext,
  TPeriodGridSize,
  TFilterUnavailabilityChecks,
  TFilterUnavailableReason,
  TMonthFilter,
  TVariable,
} from "@/types";
import { weatherYearSchema } from "@/validators";
import { FILTER_CODECS } from "./filterCodecs.util";
import { disableOtherSide } from "./pair.util";

const RESTRICTED_VARIABLES = new Set<TVariable>(PERIOD_RESTRICTED_VARIABLES);

const UNAVAILABILITY_CHECKS: TFilterUnavailabilityChecks = {
  [EFilterAvailability.WALTER_LIETH]: ({ isWalterLieth }) => isWalterLieth,
  [EFilterAvailability.HEAT_MAP]: ({ view }) => view === EFilterView.HEAT_MAP,
};

export function getFilterView(pathname: string): EFilterView | null {
  const match = Object.entries(FILTER_VIEW_BY_ROUTE).find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return match?.[1] ?? null;
}

export function isFilterRelevant(key: EFilterKey, dataset: TDataset) {
  const filterDataset = FILTERS_CONFIG[key].dataset;
  return filterDataset === undefined || filterDataset === dataset;
}

export function isVariableOffered(
  variable: TVariable,
  { dataset, climatePeriod }: Omit<TFilterOptionContext, "view">,
) {
  if (dataset === DATASETS.WEATHER) {
    return WEATHER_VARIABLES.some((weatherVariable) => weatherVariable === variable);
  }
  return climatePeriod === FULL_VARIABLES_CLIMATE_PERIOD || !RESTRICTED_VARIABLES.has(variable);
}

export function getVariableOptions(dataset: TDataset): readonly TVariable[] {
  return dataset === DATASETS.WEATHER ? WEATHER_VARIABLES : CLIMATE_VARIABLES;
}

export function isVariableOptionDisabled(variable: TVariable, context: TFilterOptionContext) {
  const isHeatMapRestricted =
    context.view === EFilterView.HEAT_MAP &&
    context.dataset === DATASETS.CLIMATE &&
    RESTRICTED_VARIABLES.has(variable);
  return isHeatMapRestricted || !isVariableOffered(variable, context);
}

export function isGridSizeOffered(
  gridSize: TCellSize,
  { dataset, climatePeriod }: TGridSizeContext,
) {
  if (gridSize !== CELL_SIZES.THIRTY_SECONDS) return true;
  return dataset === DATASETS.CLIMATE && climatePeriod === FULL_VARIABLES_CLIMATE_PERIOD;
}

export function getGridSizeContexts(filters: TFilters, view: EFilterView): TGridSizeContext[] {
  const { dataset } = filters;
  const isPeriodPair = view === EFilterView.COMPARE_PERIODS && dataset === DATASETS.CLIMATE;
  return isPeriodPair
    ? [filters.climatePeriodA, filters.climatePeriodB].map((climatePeriod) => ({
        dataset,
        climatePeriod,
      }))
    : [{ dataset, climatePeriod: filters.climatePeriod }];
}

export function isGridSizeOfferedInView(gridSize: TCellSize, filters: TFilters, view: EFilterView) {
  return getGridSizeContexts(filters, view).every((context) =>
    isGridSizeOffered(gridSize, context),
  );
}

export function getFinestGridSize(contexts: readonly TGridSizeContext[]): TCellSize {
  return (
    GRIDS_FINEST_FIRST.find((size) =>
      contexts.every((context) => isGridSizeOffered(size, context)),
    ) ?? ALWAYS_OFFERED_GRID_SIZE
  );
}

export function getDefaultGridSize(filters: TFilters, view: EFilterView): TCellSize {
  const viewDefault = GRID_SIZE_VIEW_DEFAULTS[view];
  return viewDefault !== undefined && isGridSizeOfferedInView(viewDefault, filters, view)
    ? viewDefault
    : getFinestGridSize(getGridSizeContexts(filters, view));
}

/** a choice the view doesn't offer stays in the URL, so a page that offers it gets it back */
export function resolveGridSize(filters: TFilters, view: EFilterView): TCellSize {
  const { gridSize } = filters;
  return gridSize !== null && isGridSizeOfferedInView(gridSize, filters, view)
    ? gridSize
    : getDefaultGridSize(filters, view);
}

export function getGridSizeByPeriod(filters: TFilters, view: EFilterView): TPeriodGridSize[] {
  return Object.values(CLIMATE_PERIODS).map((climatePeriod) => ({
    climatePeriod,
    gridSize: resolveGridSize(
      view === EFilterView.COMPARE_PERIODS ? filters : { ...filters, climatePeriod },
      view,
    ),
  }));
}

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

export function normalizeFilters(filters: TFilters): TFilters {
  const arePeriodsEqual = filters.climatePeriodA === filters.climatePeriodB;
  return {
    ...filters,
    variables: normalizeVariables(filters),
    gridSize:
      filters.gridSize !== null && isGridSizeOffered(filters.gridSize, filters)
        ? filters.gridSize
        : null,
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

export function isSameFilterValue<K extends EFilterKey>(key: K, a: TFilters[K], b: TFilters[K]) {
  const codec = FILTER_CODECS[key];
  return codec.encode(a) === codec.encode(b);
}

export function isFilterDefault<K extends EFilterKey>(key: K, value: TFilters[K]) {
  return isSameFilterValue(key, value, FILTERS_CONFIG[key].defaultValue);
}

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

export function getSectionFilterKeys(context: TFilterAvailabilityContext) {
  return FILTER_ORDER.filter(
    (key) =>
      FILTERS_CONFIG[key].placement === EFilterPlacement.SECTION &&
      getFilterAvailability(key, context) !== EFilterAvailability.HIDDEN,
  );
}

export function getSidebarFilterKeys(context: TFilterAvailabilityContext) {
  return FILTER_ORDER.filter(
    (key) => getFilterAvailability(key, context) !== EFilterAvailability.HIDDEN,
  );
}

export function getChipFilterKeys(context: TFilterAvailabilityContext) {
  return getSectionFilterKeys(context).filter((key) =>
    FILTER_CHIP_AVAILABILITIES.includes(getFilterAvailability(key, context)),
  );
}

export function countChangedFilters(filters: TFilters, context: TFilterAvailabilityContext) {
  return getChipFilterKeys(context).filter(
    (key) =>
      getFilterAvailability(key, context) === EFilterAvailability.AVAILABLE &&
      !isFilterDefault(key, filters[key]),
  ).length;
}

export function setFilterValue<K extends EFilterKey>(
  filters: TFilters,
  key: K,
  value: TFilters[K],
): TFilters {
  const next = { ...filters };
  next[key] = value;
  return next;
}

export function toggleFilterOption<T>(selected: readonly T[], option: T): T[] {
  return selected.includes(option)
    ? selected.filter((item) => item !== option)
    : [...selected, option];
}

export function isFilterUnavailableReason(
  availability: EFilterAvailability,
): availability is TFilterUnavailableReason {
  return availability in FILTER_UNAVAILABLE_LAYOUTS;
}

export function getFilterUnavailableLayout(availability: EFilterAvailability) {
  return isFilterUnavailableReason(availability) ? FILTER_UNAVAILABLE_LAYOUTS[availability] : null;
}

export function areFilterControlsDisabled(availability: EFilterAvailability) {
  return getFilterUnavailableLayout(availability) !== null;
}

export function getWeatherYearError(year: number) {
  const result = weatherYearSchema.safeParse(year);
  return result.success ? null : (result.error.issues[0]?.message ?? null);
}

export function findClimatePeriod(value: string): TClimatePeriod | undefined {
  return Object.values(CLIMATE_PERIODS).find((period) => period === value);
}

export function toClimatePeriodHandler(onChange: (period: TClimatePeriod) => void) {
  return (value: string) => {
    const period = findClimatePeriod(value);
    if (period !== undefined) onChange(period);
  };
}

export function toCellSizeHandler(onChange: (gridSize: TCellSize) => void) {
  return (value: string) => {
    const gridSize = Object.values(CELL_SIZES).find((size) => size === value);
    if (gridSize !== undefined) onChange(gridSize);
  };
}

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

export function getAddedWeatherPeriodError(year: number | undefined, periods: readonly number[]) {
  if (year === undefined || getWeatherYearError(year) !== null) {
    return "comparePeriods.weather.invalidYear";
  }
  return periods.includes(year) ? "comparePeriods.weather.duplicateYear" : null;
}

export function getVariableOptionStates(values: TFilters, { view }: TFilterAvailabilityContext) {
  const context = { view, dataset: values.dataset, climatePeriod: values.climatePeriod };
  return getVariableOptions(values.dataset).map((value) => ({
    value,
    isDisabled: isVariableOptionDisabled(value, context),
  }));
}

export function getGridSizeOptionStates(values: TFilters, view: EFilterView) {
  return Object.values(CELL_SIZES).map((value) => ({
    value,
    isDisabled: !isGridSizeOfferedInView(value, values, view),
  }));
}

export function getVariablesNotes(context: TFilterAvailabilityContext) {
  return VARIABLES_NOTE_RULES.filter(({ isShown }) => isShown(context)).map(({ note }) => note);
}

export function isAppliedOnSelect(key: EFilterKey) {
  return FILTERS_CONFIG[key].choice === EFilterChoice.SINGLE;
}
