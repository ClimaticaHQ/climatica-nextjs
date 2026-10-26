// * a place's marker: its shape in the main map's green (MAP_MARKER), outlined in white so it
// * reads on any tile — larger while it's the active place (px)
export const MINI_MAP_MARKER = {
  SIZE: 14,
  ACTIVE_SIZE: 20,
  OUTLINE_WIDTH: 2,
} as const;

export const MINI_MAP_TOGGLE_CLASSES = {
  BUTTON:
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[length:var(--font-xs)] font-medium transition-colors duration-150",
  ACTIVE:
    "border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]",
  IDLE: "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
} as const;
