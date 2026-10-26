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
  cell: "bg-[var(--color-surface)] px-3",
} as const;
