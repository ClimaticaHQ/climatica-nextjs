// * a place's marker: its shape in the main map's green (MAP_MARKER), outlined in white so it
// * reads on any tile — larger while it's the active place (px)
export const MINI_MAP_MARKER = {
  SIZE: 14,
  ACTIVE_SIZE: 20,
  OUTLINE_WIDTH: 2,
} as const;

// * the place toggle's bar: at least 44px inside its border (px: at every text size), the control
// * centred, so its tap targets fit in the bar and never reach the map
export const MINI_MAP_TOGGLE_BAR_CLASS =
  "flex min-h-[45px] shrink-0 items-center justify-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5";
