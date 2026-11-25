export const STATS_BAR_CONTAINER_CLASS = "@container mb-3";

export const STATS_BAR_COLUMNS: Record<number, string> = {
  4: "@sm:grid-cols-4",
  5: "@sm:grid-cols-5",
};

// * the 1px gap over the border-coloured grid draws the dividers
export const STATS_BAR_STYLE = {
  bar: "gap-px bg-[var(--color-border)]",
  cell: "bg-[var(--color-surface)] px-3",
} as const;

export const PENDING_CLIMATE_STATS = {
  meanTemp: 0,
  annualPrecip: 0,
  aridMonths: 0,
  martonneIndex: null,
} as const;
