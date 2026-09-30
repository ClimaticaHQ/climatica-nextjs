export const COMPARISON_TABLE_CLASSES = {
  TABLE: "w-full table-fixed text-[length:var(--font-sm)]",
  CAPTION: "sr-only",
  HEAD_ROW: "bg-[var(--color-bg-secondary)]",
  METRIC_COL: "w-[36%] sm:w-[28%]",
  HEAD_CELL: "px-3 py-2.5 text-right align-bottom font-semibold sm:px-4",
  METRIC_HEAD: "px-3 py-2.5 text-left sm:px-4",
  SERIES_NAME: "inline-flex max-w-full items-center justify-end gap-1.5",
  SERIES_LABEL: "truncate",
  // * the difference column: from `sm`; below it, the difference is a line under B's value
  DIFFERENCE: "max-sm:hidden",
  DIFFERENCE_BELOW: "sm:hidden",
  MUTED_LINE: "block text-[11px] font-normal text-[var(--color-text-secondary)]",
  // * a series name in the direction line never breaks — the line wraps at the minus only
  NO_WRAP: "whitespace-nowrap",
  ROW: "border-t border-[var(--color-border)]",
  METRIC_CELL: "px-3 py-2 text-left font-normal text-[var(--color-text-secondary)] sm:px-4",
  VALUE_CELL: "px-3 py-2 text-right tabular-nums font-medium sm:px-4",
  VALUE_LINE: "inline-flex max-w-full items-center justify-end gap-1.5",
  DIFFERENCE_CELL:
    "px-3 py-2 text-right tabular-nums text-[var(--color-text-secondary)] max-sm:hidden sm:px-4",
} as const;
