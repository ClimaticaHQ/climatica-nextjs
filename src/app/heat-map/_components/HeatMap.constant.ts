import { FORM_CONTROL_CLASSES as FC } from "@/constants";
import type { TUrlSchema } from "@/types";
import { selectionUrlField } from "./HeatMap.util";
import type { THeatMapUrlState } from "./HeatMap.type";

export const HEAT_MAP_URL_SCHEMA: TUrlSchema<THeatMapUrlState> = {
  selection: selectionUrlField,
};

// * decimals of the heat map's values (legend, popups, export): one; coordinates in popups three
export const HEATMAP_VALUE_DIGITS = 1;
export const HEATMAP_COORDINATE_DIGITS = 3;

// * the region's stats: one row of six from `sm`, three per row below; a 1px gap over the
// * border colour draws the dividers. The bar is its own size container (the cells' text scales)
export const STATS_LEGEND_BAR_CLASSES = {
  FRAME: "@container",
  GRID: "grid grid-cols-3 gap-px bg-[var(--color-border)] sm:grid-cols-6",
  CELL: "bg-[var(--color-surface)] px-3",
  VALUE_SKELETON:
    "inline-block h-4 w-14 animate-pulse rounded bg-[var(--color-border)] align-middle",
  LEGEND: "border-t border-[var(--color-border)] px-3.5 py-2",
  GRADIENT: "h-2.5 w-full rounded sm:h-3",
  GRADIENT_LABELS: "mt-1 flex justify-between",
  GRADIENT_LABEL: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
  SUBTITLE: "truncate",
} as const;

export const STATS_LEGEND_GRADIENT_STOPS = 10;

// * the live cell count on a shape being drawn: a Leaflet tooltip restyled in leaflet.css
export const DRAWING_CELL_COUNT_TOOLTIP_CLASS = "drawing-cell-count";

// * the map toolbar: its draw toggles share the form controls' frame and height
export const TOOLBAR_CLASSES = {
  DRAW_BUTTON: `${FC.FRAME} ${FC.HEIGHT} flex items-center gap-2 px-3 text-[length:var(--font-sm)] font-medium transition-colors duration-150`,
  DRAW_ACTIVE:
    "border-[var(--color-brand)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]",
  DRAW_IDLE: `${FC.BORDER_COLOR} bg-[var(--color-surface)] text-[var(--color-text-secondary)] ${FC.HOVER}`,
  CLEAR_BUTTON: `${FC.HEIGHT} flex items-center gap-2 px-3 text-[length:var(--font-sm)]`,
} as const;
