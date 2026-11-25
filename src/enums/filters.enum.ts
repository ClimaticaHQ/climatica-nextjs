/** values double as the TFilters field names */
export enum EFilterKey {
  DATASET = "dataset",
  CLIMATE_PERIOD = "climatePeriod",
  WEATHER_YEAR = "weatherYear",
  VARIABLES = "variables",
  GRID_SIZE = "gridSize",
  MONTHS = "months",
  CLIMATE_PERIOD_A = "climatePeriodA",
  CLIMATE_PERIOD_B = "climatePeriodB",
  WEATHER_PERIODS = "weatherPeriods",
}

export enum EFilterView {
  CLIMATE_STATISTICS = "climateStatistics",
  COMPARE_CITIES = "compareCities",
  COMPARE_PERIODS = "comparePeriods",
  HEAT_MAP = "heatMap",
}

export enum EFilterChoice {
  SINGLE = "single",
  MULTI = "multi",
  INPUT = "input",
}

export enum EFilterPlacement {
  SECTION = "section",
  PAGE_BELOW_LG = "pageBelowLg",
}

export enum EFilterAvailability {
  AVAILABLE = "available",
  HIDDEN = "hidden",
  WALTER_LIETH = "walterLieth",
  HEAT_MAP = "heatMap",
}

export enum EFilterApplyMode {
  QUICK = "quick",
  APPLY = "apply",
}

export enum EFilterNavigation {
  REPLACE = "replace",
  PUSH = "push",
}

export enum EFilterNoteVariant {
  INFO = "info",
  MUTED = "muted",
  ERROR = "error",
}

export enum EFiltersSheetMode {
  ALL = "all",
  SINGLE = "single",
  UNAVAILABLE_INFO = "unavailableInfo",
}
