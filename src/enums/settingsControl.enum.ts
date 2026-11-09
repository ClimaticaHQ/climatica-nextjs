/** Where a settings row puts its control against its label and description. */
export enum ESettingsControlPlacement {
  /** beside them while both fit at their natural widths, else under them across the row */
  FIT = "fit",
  /** always on the right: the label wraps instead (a switch, a dropdown) */
  BESIDE = "beside",
  /** always under them, across the row (the bar style cards) */
  BELOW = "below",
}
