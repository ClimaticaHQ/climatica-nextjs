/** How the chart card lays out its series. */
export enum EChartBody {
  /** one panel, no layout switch */
  SINGLE = "single",
  /** two panels side by side */
  SPLIT = "split",
  /** every shown series in one chart */
  OVERLAY = "overlay",
}

/** Everything drawn under or around a chart. Each member needs its CHART_BLOCKS entry. */
export enum EChartBlock {
  VALUES_TABLE = "valuesTable",
  LEGEND = "legend",
  STATS_TABLE = "statsTable",
}

export enum EChartBlockPlacement {
  /** under every chart: each split panel gets its own */
  PANEL = "panel",
  /** once under the body: split panels share it */
  BODY = "body",
  /** above the chart card, in the chart section */
  SECTION = "section",
}

/** What a pair's difference compares — its header explains a positive value by it. */
export enum EDifferenceMeaning {
  /** the second city against the first */
  CITIES = "cities",
  /** the later period against the earlier */
  PERIODS = "periods",
}
