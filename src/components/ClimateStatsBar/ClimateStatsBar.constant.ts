// * the bar is its own size container: one row per metric once it's `@sm` (24rem) wide,
// * two columns below — by its own width, so a narrow split panel wraps like a phone does
export const STATS_BAR_CONTAINER_CLASS = "@container mb-3";

export const STATS_BAR_COLUMNS: Record<number, string> = {
  4: "@sm:grid-cols-4",
  5: "@sm:grid-cols-5",
};

// * inside its Card: the 1px gap over the border-colored grid draws the dividers between cells
export const STATS_BAR_STYLE = {
  bar: "gap-px bg-[var(--color-border)]",
  cell: "bg-[var(--color-bg)] px-3",
} as const;

// * text sizes scale with the bar's own width (container query units), so a wide bar gets
// * the larger sizes and a narrow split panel's five cells still keep their values on one line
export const STAT_TEXT_CLASSES = {
  LABEL: "text-[clamp(11px,3cqi,12px)]",
  VALUE: "text-[clamp(15px,4.4cqi,18px)]",
  META: "text-[clamp(11px,3cqi,12px)]",
} as const;
