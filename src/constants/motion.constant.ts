// * UI motion — every duration here is skipped under prefers-reduced-motion
export const MOTION = {
  // * a SegmentedControl's active pill sliding to the selected option
  CONTROL_SLIDE_MS: 200,
  // * a chart card crossfading its content when the chart type or layout changes
  CHART_CROSSFADE_MS: 180,
  // * a split panel expanding, collapsing or switching series: fade plus a slight scale-up,
  // * from the side the panel sits on in the split
  PANEL_EXPAND_MS: 200,
  PANEL_EXPAND_SCALE_FROM: 0.985,
  PANEL_EXPAND_EASING: "ease-out",
  REDUCED_MOTION_QUERY: "(prefers-reduced-motion: reduce)",
} as const;
