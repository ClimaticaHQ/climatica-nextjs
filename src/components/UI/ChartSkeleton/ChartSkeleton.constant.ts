export const CHART_SKELETON_CLASSES = {
  ROOT: "relative",
  PLOT: "absolute inset-x-10 top-6 bottom-8 animate-pulse border-b border-l border-[var(--color-border)]",
  GRID: "absolute inset-x-0 h-px bg-[var(--color-border)] opacity-50",
  BARS: "absolute inset-0 flex items-end justify-around px-[2%]",
  BAR: "w-[4%] rounded-t-[var(--radius-xs)] bg-[var(--color-border)]",
  CURVE: "absolute inset-0 size-full overflow-visible",
} as const;

export const CHART_SKELETON_BARS = [62, 55, 48, 40, 34, 22, 14, 18, 30, 46, 58, 64] as const;
export const CHART_SKELETON_GRID_LINES = ["25%", "50%", "75%"] as const;
export const CHART_SKELETON_CURVE =
  "0,70 9,66 18,58 27,48 36,38 45,30 55,26 64,28 73,36 82,48 91,60 100,68";
export const CHART_SKELETON_CURVE_STYLE = {
  STROKE: "var(--color-border)",
  STROKE_WIDTH: 2,
  VIEW_BOX: "0 0 100 100",
} as const;
