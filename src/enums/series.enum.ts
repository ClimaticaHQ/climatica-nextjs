/** What a chart series is: the rules inherent to each are in SERIES_KIND_RULES. */
export enum ESeriesKind {
  CITY = "city",
  CLIMATE_PERIOD = "climatePeriod",
  WEATHER_YEAR = "weatherYear",
}

/** Where the chart title's names come from. */
export enum ESeriesTitleSource {
  /** the series' own labels: one city, or "A vs B" */
  SERIES_LABELS = "seriesLabels",
  /** the page's names (the one city every series belongs to) */
  PAGE = "page",
}
