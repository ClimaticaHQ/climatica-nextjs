import {
  EFilterApplyMode,
  EFilterAvailability,
  EFilterChoice,
  EFilterHintVariant,
  EFilterKey,
  EFilterNavigation,
  EFilterPlacement,
  EFilterView,
} from "@/enums";
import type {
  TFilterHintRule,
  TFilters,
  TFilterNavigationModes,
  TFiltersConfig,
  TFilterUnavailableLayouts,
} from "@/types";
import { MAX_PERIODS, MIN_PERIODS } from "./comparePeriods.constant";
import { ROUTES } from "./route.constant";
import { DATASETS, DEFAULT_VARIABLES, SIDEBAR_PARAMS } from "./sidebar.constant";
import {
  CELL_SIZES,
  CLIMATE_PERIODS,
  CLIMATE_VARIABLES,
  WEATHER_MAX_YEAR,
} from "./worldclim.constant";

// * written for "all" months, and read back as all months
export const ALL_MONTHS = "all";
export const MONTHS_IN_YEAR = 12;
export const MONTH_NUMBERS = Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1);

// * list values (variables, months, years) travel comma-joined
export const FILTER_LIST_SEPARATOR = ",";

export const FILTER_WEATHER_PERIODS_LIMITS = { MIN: MIN_PERIODS, MAX: MAX_PERIODS } as const;

// * the period whose normals carry every variable and the 30s grid
export const FULL_VARIABLES_CLIMATE_PERIOD = CLIMATE_PERIODS.C1970_2000;
// * where the 30s grid falls back to when it isn't offered
export const FALLBACK_GRID_SIZE = CELL_SIZES.TWO_POINT_FIVE_MINUTES;

// * the years Compare Periods opens with on the Weather dataset
export const DEFAULT_WEATHER_PERIODS = [2021, 1967] as const;

export const FILTER_DEFAULTS: TFilters = {
  [EFilterKey.DATASET]: DATASETS.CLIMATE,
  [EFilterKey.CLIMATE_PERIOD]: CLIMATE_PERIODS.C1970_2000,
  [EFilterKey.WEATHER_YEAR]: WEATHER_MAX_YEAR,
  [EFilterKey.VARIABLES]: [...DEFAULT_VARIABLES],
  [EFilterKey.GRID_SIZE]: CELL_SIZES.TWO_POINT_FIVE_MINUTES,
  [EFilterKey.MONTHS]: ALL_MONTHS,
  [EFilterKey.CLIMATE_PERIOD_A]: CLIMATE_PERIODS.C1970_2000,
  [EFilterKey.CLIMATE_PERIOD_B]: CLIMATE_PERIODS.C1991_2020,
  [EFilterKey.WEATHER_PERIODS]: [...DEFAULT_WEATHER_PERIODS],
};

const ALL_VIEWS = Object.values(EFilterView);
const SINGLE_PERIOD_VIEWS = ALL_VIEWS.filter((view) => view !== EFilterView.COMPARE_PERIODS);
const CLIMATE_PERIOD_OPTIONS = Object.values(CLIMATE_PERIODS);

/** Every filter, described once — sidebar, chips, sheets, URL and badge all read from here. */
export const FILTERS_CONFIG: TFiltersConfig = {
  [EFilterKey.DATASET]: {
    key: EFilterKey.DATASET,
    param: SIDEBAR_PARAMS.DATASET,
    labelKey: "sidebar.sections.dataset",
    choice: EFilterChoice.SINGLE,
    placement: EFilterPlacement.SECTION,
    views: ALL_VIEWS,
    defaultValue: FILTER_DEFAULTS[EFilterKey.DATASET],
    options: Object.values(DATASETS),
  },
  [EFilterKey.CLIMATE_PERIOD]: {
    key: EFilterKey.CLIMATE_PERIOD,
    param: SIDEBAR_PARAMS.PERIOD,
    labelKey: "sidebar.sections.climatePeriod",
    choice: EFilterChoice.SINGLE,
    placement: EFilterPlacement.SECTION,
    views: SINGLE_PERIOD_VIEWS,
    dataset: DATASETS.CLIMATE,
    defaultValue: FILTER_DEFAULTS[EFilterKey.CLIMATE_PERIOD],
    options: CLIMATE_PERIOD_OPTIONS,
  },
  [EFilterKey.WEATHER_YEAR]: {
    key: EFilterKey.WEATHER_YEAR,
    param: SIDEBAR_PARAMS.YEAR,
    labelKey: "sidebar.sections.yearRange",
    choice: EFilterChoice.INPUT,
    placement: EFilterPlacement.SECTION,
    views: SINGLE_PERIOD_VIEWS,
    dataset: DATASETS.WEATHER,
    defaultValue: FILTER_DEFAULTS[EFilterKey.WEATHER_YEAR],
  },
  [EFilterKey.VARIABLES]: {
    key: EFilterKey.VARIABLES,
    param: SIDEBAR_PARAMS.VAR,
    labelKey: "sidebar.sections.variables",
    choice: EFilterChoice.MULTI,
    placement: EFilterPlacement.SECTION,
    views: ALL_VIEWS,
    // * Walter-Lieth always plots mean temperature and precipitation
    unavailableWhen: [EFilterAvailability.WALTER_LIETH],
    defaultValue: FILTER_DEFAULTS[EFilterKey.VARIABLES],
    options: CLIMATE_VARIABLES,
  },
  [EFilterKey.GRID_SIZE]: {
    key: EFilterKey.GRID_SIZE,
    param: SIDEBAR_PARAMS.GRID,
    labelKey: "climateStatistics.cellResolution",
    choice: EFilterChoice.SINGLE,
    placement: EFilterPlacement.SECTION,
    views: ALL_VIEWS,
    defaultValue: FILTER_DEFAULTS[EFilterKey.GRID_SIZE],
    options: Object.values(CELL_SIZES),
  },
  [EFilterKey.MONTHS]: {
    key: EFilterKey.MONTHS,
    param: SIDEBAR_PARAMS.MONTHS,
    labelKey: "sidebar.sections.months",
    choice: EFilterChoice.MULTI,
    placement: EFilterPlacement.SECTION,
    views: ALL_VIEWS,
    // * Walter-Lieth always plots all 12 months; the heat map shows annual values
    unavailableWhen: [EFilterAvailability.HEAT_MAP, EFilterAvailability.WALTER_LIETH],
    defaultValue: FILTER_DEFAULTS[EFilterKey.MONTHS],
    options: MONTH_NUMBERS,
  },
  [EFilterKey.CLIMATE_PERIOD_A]: {
    key: EFilterKey.CLIMATE_PERIOD_A,
    param: SIDEBAR_PARAMS.PERIOD_A,
    labelKey: "climateComparison.periodA",
    choice: EFilterChoice.SINGLE,
    placement: EFilterPlacement.PAGE_BELOW_LG,
    views: [EFilterView.COMPARE_PERIODS],
    dataset: DATASETS.CLIMATE,
    defaultValue: FILTER_DEFAULTS[EFilterKey.CLIMATE_PERIOD_A],
    options: CLIMATE_PERIOD_OPTIONS,
  },
  [EFilterKey.CLIMATE_PERIOD_B]: {
    key: EFilterKey.CLIMATE_PERIOD_B,
    param: SIDEBAR_PARAMS.PERIOD_B,
    labelKey: "climateComparison.periodB",
    choice: EFilterChoice.SINGLE,
    placement: EFilterPlacement.PAGE_BELOW_LG,
    views: [EFilterView.COMPARE_PERIODS],
    dataset: DATASETS.CLIMATE,
    defaultValue: FILTER_DEFAULTS[EFilterKey.CLIMATE_PERIOD_B],
    options: CLIMATE_PERIOD_OPTIONS,
  },
  [EFilterKey.WEATHER_PERIODS]: {
    key: EFilterKey.WEATHER_PERIODS,
    param: SIDEBAR_PARAMS.PERIODS,
    legacyParams: [SIDEBAR_PARAMS.YEAR_A, SIDEBAR_PARAMS.YEAR_B],
    labelKey: "sidebar.sections.yearRange",
    choice: EFilterChoice.INPUT,
    placement: EFilterPlacement.PAGE_BELOW_LG,
    views: [EFilterView.COMPARE_PERIODS],
    dataset: DATASETS.WEATHER,
    defaultValue: FILTER_DEFAULTS[EFilterKey.WEATHER_PERIODS],
  },
};

/** Sidebar / full-sheet / chip order; also the order params are written in. */
export const FILTER_ORDER = [
  EFilterKey.DATASET,
  EFilterKey.CLIMATE_PERIOD,
  EFilterKey.CLIMATE_PERIOD_A,
  EFilterKey.CLIMATE_PERIOD_B,
  EFilterKey.WEATHER_YEAR,
  EFilterKey.WEATHER_PERIODS,
  EFilterKey.VARIABLES,
  EFilterKey.GRID_SIZE,
  EFilterKey.MONTHS,
] as const satisfies readonly EFilterKey[];

/** The one place deciding how a filter change navigates: back returns to the previous Apply. */
export const FILTER_NAVIGATION_MODES: TFilterNavigationModes = {
  [EFilterApplyMode.QUICK]: EFilterNavigation.REPLACE,
  [EFilterApplyMode.APPLY]: EFilterNavigation.PUSH,
};

export const FILTER_VIEW_BY_ROUTE = {
  [ROUTES.CLIMATE_STATISTICS]: EFilterView.CLIMATE_STATISTICS,
  [ROUTES.COMPARE_CITIES]: EFilterView.COMPARE_CITIES,
  [ROUTES.COMPARE_PERIODS]: EFilterView.COMPARE_PERIODS,
  [ROUTES.HEAT_MAP]: EFilterView.HEAT_MAP,
} as const;

// * the explanation shown under a filter that's disabled in the current view
export const FILTER_UNAVAILABLE_NOTE_KEYS: Partial<Record<EFilterAvailability, string>> = {
  [EFilterAvailability.WALTER_LIETH]: "chart.walterLiethTabUnavailable",
  [EFilterAvailability.HEAT_MAP]: "sidebar.notes.notAvailableHeatmap",
};

// * how a section disabled for each reason looks: the heat map dims the whole section (note
// * above), Walter-Lieth disables the controls (note below)
export const FILTER_UNAVAILABLE_LAYOUTS: TFilterUnavailableLayouts = {
  [EFilterAvailability.WALTER_LIETH]: {
    isDimmed: false,
    isNoteFirst: false,
    noteVariant: EFilterHintVariant.INFO,
    noteClassName: "mt-1.5",
  },
  [EFilterAvailability.HEAT_MAP]: {
    isDimmed: true,
    isNoteFirst: true,
    noteVariant: EFilterHintVariant.MUTED,
    noteClassName: "mb-1.5",
  },
};

// * the view whose sections a page without filters (home, not found) shows
export const FILTER_FALLBACK_VIEW = EFilterView.CLIMATE_STATISTICS;

// * the heat map can't load more cells than this: Apply (and auto-apply) is blocked above it
export const FILTER_MAX_HEATMAP_CELLS = 10_000;

// * notes under the variable chips, by context
export const VARIABLES_HINT_RULES: readonly TFilterHintRule[] = [
  {
    isShown: ({ dataset }) => dataset === DATASETS.WEATHER,
    hint: { textKey: "sidebar.notes.weatherVariables", variant: EFilterHintVariant.INFO },
  },
  {
    isShown: ({ view, dataset }) => view === EFilterView.HEAT_MAP && dataset === DATASETS.CLIMATE,
    hint: { textKey: "sidebar.notes.notAvailableHeatmap", variant: EFilterHintVariant.MUTED },
  },
];

// * the chips a view shows: changeable filters, plus — disabled, explained on tap — the ones only
// * Walter-Lieth blocks (switching the chart frees them); the heat map's months stay hidden
export const FILTER_CHIP_AVAILABILITIES: readonly EFilterAvailability[] = [
  EFilterAvailability.AVAILABLE,
  EFilterAvailability.WALTER_LIETH,
];
