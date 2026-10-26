/** A side of a compared pair — Period A / B, or the two weather years shown as diagrams. */
export enum EPairSide {
  A = "a",
  B = "b",
}

/** Where a pair sits side by side, with a control between (the swap). */
export enum EPairLayoutVariant {
  /** a filter row on the page */
  ROW = "row",
  /** the sidebar's narrow section: stacked until it has room */
  COMPACT = "compact",
  /** the chart's two panels */
  PANELS = "panels",
}
