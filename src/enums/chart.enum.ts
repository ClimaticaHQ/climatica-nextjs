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
}

export enum EChartBlockPlacement {
  /** under every chart: each split panel gets its own */
  PANEL = "panel",
  /** once under the body: split panels share it */
  BODY = "body",
}
