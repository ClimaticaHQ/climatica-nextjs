export enum EChartBody {
  SINGLE = "single",
  SPLIT = "split",
  OVERLAY = "overlay",
}

/** each member needs its CHART_BLOCKS entry */
export enum EChartBlock {
  VALUES_TABLE = "valuesTable",
  LEGEND = "legend",
  STATS_TABLE = "statsTable",
}

export enum EChartBlockPlacement {
  PANEL = "panel",
  BODY = "body",
  SECTION = "section",
}

export enum EDifferenceMeaning {
  CITIES = "cities",
  PERIODS = "periods",
}

export enum EChartValueAxis {
  TEMPERATURE = "temperature",
  PRECIPITATION = "precipitation",
}

export enum EStatsBarItem {
  MEAN_TEMP = "meanTemp",
  ANNUAL_PRECIP = "annualPrecip",
  ARID_MONTHS = "aridMonths",
  ALTITUDE = "altitude",
  MARTONNE = "martonne",
}
