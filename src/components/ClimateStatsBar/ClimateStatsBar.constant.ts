import type { TStatsBarStyle } from "./ClimateStatsBar.type";

// * the bar is its own size container: one row per metric once it's `@sm` (24rem) wide,
// * two columns below — by its own width, so a narrow split panel wraps like a phone does
export const STATS_BAR_CONTAINER_CLASS = "@container mb-3";

export const STATS_BAR_COLUMNS: Record<number, string> = {
  4: "@sm:grid-cols-4",
  5: "@sm:grid-cols-5",
};

export const STATS_BAR_STYLE = {
  // * the 1px gap over the border-colored bar draws the dividers between cells
  FRAMED: {
    bar: "gap-px bg-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)]",
    cell: "bg-[var(--color-bg)] px-3",
  },
  // * inside a panel card: a thin frame with a smaller radius than the card's, cells unpainted
  // * on the card's surface and a little tighter (five share half a chart card); the dividers
  // * are cell borders — a painted bar would bleed through at fractional pixel edges
  PANEL: {
    bar: "rounded-[var(--radius-sm)] border border-[var(--color-border)]",
    cell: "px-2 border-[var(--color-border)] @max-sm:even:border-l @max-sm:nth-[n+3]:border-t @sm:not-first:border-l",
  },
} as const satisfies Record<string, TStatsBarStyle>;

// * text sizes scale with the bar's own width (container query units), so a wide bar gets
// * the larger sizes and a narrow split panel's five cells still keep their values on one line
export const STAT_TEXT_CLASSES = {
  LABEL: "text-[clamp(11px,3cqi,12px)]",
  VALUE: "text-[clamp(15px,4.4cqi,18px)]",
  META: "text-[clamp(11px,3cqi,12px)]",
} as const;
