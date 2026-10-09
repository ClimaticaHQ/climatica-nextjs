// * phones: a narrower label column, and each year at least DATA_COL_MIN_REM wide — with 4–5
// * years the table scrolls sideways (labels pinned) instead of squeezing values into wraps
export const LABEL_COL_MIN_REM = 7;
export const DATA_COL_MIN_REM = 5.5;
// * the label column's width, read by every column's width (and the table's minimum)
export const LABEL_COL_VAR = "var(--stats-label-col)";

export const MULTI_PERIOD_STATS_CLASSES = {
  // * the label column's width lives on the frame: the table and the start fade read it
  FRAME: "@container/stats relative [--stats-label-col:7rem] sm:[--stats-label-col:11.25rem]",
  SCROLLER: "overflow-x-auto",
  TABLE: "w-full table-fixed text-[length:var(--font-sm)]",
  // * pinned while the years scroll; the row's background shows through
  LABEL_CELL:
    "sticky left-0 z-10 h-11 bg-inherit px-3 py-2.5 text-[var(--color-text-secondary)] sm:px-4",
  HEAD_LABEL:
    "sticky left-0 z-10 h-11 bg-inherit px-3 py-2.5 text-left font-medium text-[var(--color-text-secondary)] sm:px-4",
  VALUE_CELL: "h-11 whitespace-nowrap px-2 py-2.5 text-center font-semibold sm:px-4",
  HEAD_CELL: "h-11 whitespace-nowrap px-2 py-2.5 text-center font-semibold sm:px-4",
  SKELETON_CELL: "h-11 px-2 py-2.5 sm:px-4",
  // * the class under the number, beside it only where the table is wide (1440 px with five
  // * years) — by the table's width, not the viewport's: the sidebar narrows it at 1024 px
  MARTONNE:
    "inline-flex flex-col items-center gap-0.5 @min-[52rem]/stats:flex-row @min-[52rem]/stats:gap-1.5",
  MARTONNE_CLASS: "whitespace-nowrap rounded-lg px-1.5 py-0.5 text-[10px] font-medium",
} as const;
