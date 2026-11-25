export const SPLIT_PANEL_HEADER_CLASSES = {
  FRAME: "mb-2 flex items-start justify-between gap-2",
  TITLE_BLOCK: "min-w-0",
  NAME_ROW:
    "flex items-center gap-2 text-[length:var(--font-sm)] font-semibold text-[var(--color-text)]",
  NAME: "truncate",
  SUBTITLE: "truncate text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
} as const;
