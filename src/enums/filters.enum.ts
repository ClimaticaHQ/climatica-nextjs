/** Every filter the app knows. Values double as the TFilters field names. */
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

/** The pages that render filters. */
export enum EFilterView {
  CLIMATE_STATISTICS = "climateStatistics",
  COMPARE_CITIES = "compareCities",
  COMPARE_PERIODS = "comparePeriods",
  HEAT_MAP = "heatMap",
}

/** How a filter is picked: one option (applies at once), several, or typed in (needs Apply). */
export enum EFilterChoice {
  SINGLE = "single",
  MULTI = "multi",
  INPUT = "input",
}

/** Where a filter lives. */
export enum EFilterPlacement {
  // * a section: the sidebar, the mobile chips and sheets
  SECTION = "section",
  // * Compare Periods' periods and years: on the page below lg (applied at once), a sidebar
  // * section from lg (part of its draft) — never a chip or a sheet section
  PAGE_BELOW_LG = "pageBelowLg",
}

/** Whether a filter can be used in the current view, and if not, why. */
export enum EFilterAvailability {
  AVAILABLE = "available",
  // * not part of this view or dataset at all — never rendered
  HIDDEN = "hidden",
  // * rendered disabled, with an explanation
  WALTER_LIETH = "walterLieth",
  HEAT_MAP = "heatMap",
}

/** A quick single-filter change, or an explicit Apply of several. */
export enum EFilterApplyMode {
  QUICK = "quick",
  APPLY = "apply",
}

/** The router method a filter change navigates with. */
export enum EFilterNavigation {
  REPLACE = "replace",
  PUSH = "push",
}

/** How a note under a filter reads: a plain explanation, a muted aside, or an error. */
export enum EFilterHintVariant {
  INFO = "info",
  MUTED = "muted",
  ERROR = "error",
}

/** Which mobile filter sheet is open: every filter, one filter's, or the Walter-Lieth note. */
export enum EMobileFilterSheet {
  ALL = "all",
  SINGLE = "single",
  // * why Walter-Lieth disables variables and months, and the way out
  WALTER_LIETH_INFO = "walterLiethInfo",
}
