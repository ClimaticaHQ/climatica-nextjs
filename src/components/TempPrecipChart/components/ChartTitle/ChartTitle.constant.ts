export const CHART_TITLE_CLASSES = {
  EYEBROW: "text-[12px] font-medium text-[var(--color-text-secondary)]",
  HEADING:
    "font-semibold text-[length:var(--font-md)] md:text-[length:var(--font-lg)] text-[var(--color-text)]",
  // * one location: may wrap, clamped to two lines
  SINGLE: "line-clamp-2 break-words",
  // * "A vs B" on one line: each name truncates on its own; B keeps up to this share, so
  // * "vs B" always shows even next to a very long A
  PAIR: "flex min-w-0 items-baseline gap-1.5",
  NAME_A: "min-w-0 truncate",
  NAME_B: "min-w-0 max-w-[45%] shrink-0 truncate",
  VERSUS: "shrink-0 font-normal text-[var(--color-text-secondary)]",
  SUBTITLE_ROW: "flex flex-wrap items-center gap-2",
  SUBTITLE: "flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]",
  MONTH_BADGE:
    "rounded-full border-[0.5px] border-[var(--color-month-badge-border)] bg-[var(--color-month-badge-bg)] px-2.5 py-0.5 text-[12px] text-[var(--color-month-badge-text)]",
} as const;
