// * hairline cell borders, as in the stats bars
export const TABLE_CELL_BORDER = "0.5px solid var(--color-border)";

export const TABLE_GEOMETRY = {
  // * px — the row-label column: variable only (one series), or variable — series (compare)
  LABEL_COL_WIDTH: { SINGLE: 110, MULTI: 210 },
  // * px per month below which the table scrolls sideways instead of squeezing
  MIN_MONTH_COL_WIDTH: 44,
} as const;

export const TABLE_ACTIVE_CELL_STYLE = {
  backgroundColor: "var(--color-chip-active-bg)",
  color: "var(--color-chip-active-text)",
} as const;

export const TABLE_CLASSES = {
  // * scrolls sideways inside its own frame on narrow screens — never the page
  FRAME: "overflow-x-auto rounded-[var(--radius-md)]",
  TABLE: "w-full table-fixed border-collapse",
  CAPTION: "sr-only",
  // * the row labels stay put while the months scroll under them; the hairline on their right
  // * edge stays with them (a border would scroll away with the first month's cell)
  STICKY: "sticky left-0 z-[1] bg-[var(--color-bg)] shadow-[0.5px_0_0_var(--color-border)]",
  CORNER: "px-4 py-[10px]",
  MONTH: "px-1 py-[10px] text-center text-[11px] font-normal text-[var(--color-text-secondary)]",
  ROW_HEADER: "px-4 py-[10px] text-left text-[11px] font-normal text-[var(--color-text-secondary)]",
  ROW_LABEL: "flex min-w-0 items-center gap-1.5",
  ROW_LABEL_TEXT: "truncate",
  VALUE: "px-1 py-[10px] text-center text-[16px] font-medium tabular-nums text-[var(--color-text)]",
} as const;
