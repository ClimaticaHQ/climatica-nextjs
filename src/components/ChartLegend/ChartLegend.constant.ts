import { CHART_LEGEND } from "@/constants";

export const CHART_LEGEND_CLASSES = {
  // * the same gap below every plot area / split pair; items wrap and stay centered
  // * the same reserved height for every chart type — two rows from `sm`, three below (`lh`:
  // * the legend's own line height) — so a legend with more entries doesn't grow the card
  LIST: `${CHART_LEGEND.GAP_CLASS} m-0 flex list-none flex-wrap content-start justify-center gap-x-5 gap-y-1.5 p-0 text-[var(--color-text-secondary)] min-h-[calc(3lh+0.75rem)] sm:min-h-[calc(2lh+0.375rem)]`,
  ITEM: "flex items-center gap-1.5",
} as const;
