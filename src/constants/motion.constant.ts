// * UI motion — every duration here is skipped under prefers-reduced-motion
export const MOTION = {
  // * a SegmentedControl's active pill sliding to the selected option
  CONTROL_SLIDE_MS: 200,
  // * a chart card crossfading its content when the chart type or layout changes
  CHART_CROSSFADE_MS: 180,
  REDUCED_MOTION_QUERY: "(prefers-reduced-motion: reduce)",
} as const;
