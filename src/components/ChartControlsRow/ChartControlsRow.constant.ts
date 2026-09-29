// * a fixed slot under the chart card header: the same place and min-height in every chart
// * type and layout (variable chips, WL shading, or the WL note), so switching moves nothing.
// * The min-height fits the tallest content — a segmented control (a 44 px touch target
// * below `sm`), or the chips wrapped into two rows on a phone
export const CHART_CONTROLS_ROW_CLASSES = {
  ROW: "mb-3 flex min-h-[5.5rem] flex-wrap content-center items-center gap-2 sm:min-h-10",
  NOTE: "text-[length:var(--font-sm)] text-[var(--color-text-secondary)]",
} as const;
