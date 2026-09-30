// * a fixed slot under the chart card header, right-aligned: the same place and min-height in
// * both chart types for a layout, so switching between them moves nothing. The min-height
// * fits the tallest content — a segmented control (a 44 px touch target below `sm`), or the
// * chips wrapped into two rows on a phone
export const CHART_CONTROLS_ROW_CLASSES = {
  ROW: "mb-3 flex min-h-[5.5rem] flex-wrap content-center items-center justify-end gap-2 sm:min-h-10",
  // * overlay: WL stacks the shading control over the guide button (both 44 px touch targets
  // * below `sm`) — the standard chart's chips get the same room
  STACKED: "mb-3 flex min-h-24 flex-col items-end justify-center gap-1 sm:min-h-[4.5rem]",
} as const;
