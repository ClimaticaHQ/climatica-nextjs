import { FORM_CONTROL_CLASSES } from "@/constants";
import { getPairShape } from "@/utils/seriesShape.util";
import { EFilterAvailability, EFilterNoteVariant, EPairSide, EWalterLiethSeriesId } from "@/enums";
import { getSwitchToStandardChartLabel } from "@/utils/chartMode.util";
import type { TFilterUnavailableActionLabels } from "./filters.type";

export const FILTER_SECTION_DIMMED_CLASS = "pointer-events-none opacity-40";

export const FILTER_NOTE_CLASSES: Record<EFilterNoteVariant, string> = {
  [EFilterNoteVariant.INFO]: "text-[length:var(--font-xs)] text-[var(--color-text-secondary)]",
  [EFilterNoteVariant.MUTED]: "text-[11px] italic text-[var(--color-text-secondary)]",
  [EFilterNoteVariant.ERROR]: "text-[length:var(--font-xs)] text-[var(--color-error)]",
};

export const FILTER_UNAVAILABLE_ACTION_LABELS: TFilterUnavailableActionLabels = {
  [EFilterAvailability.WALTER_LIETH]: getSwitchToStandardChartLabel,
};

export const FILTER_UNAVAILABLE_ACTION_CLASS =
  "mt-1 inline-flex items-center text-[length:var(--font-xs)] font-medium text-[var(--color-primary)] underline-offset-2 hover:underline max-lg:min-h-11";

// * a column from lg up; below lg the filters live in the filter bar's sheet
export const FILTERS_SIDEBAR_CLASS =
  "hidden w-80 shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex";

// * the sidebar's filter sections, scrolling between the top bar and the Apply button
export const FILTERS_SIDEBAR_SECTIONS_CLASS = "flex flex-1 flex-col gap-8 overflow-y-auto p-4";

export const FILTER_BAR_CLASSES = {
  ROOT: "flex items-center gap-2",
  DIVIDER: "h-6 w-px shrink-0 bg-[var(--color-border)]",
} as const;

export const FILTERS_SHEET_BUTTON_CLASS = "min-h-11 flex-1 px-4 text-[length:var(--font-base)]";

export const RESOLUTION_LABEL_CLASS =
  "mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]";

export const COMPARED_PERIODS_CLASSES = {
  // * on the page below lg; hidden from lg by CSS too, so the server render (no viewport yet)
  // * never flashes it on a desktop, where the sidebar has it as a section
  PAGE: "w-full max-w-xl lg:hidden",
  // * compact (sidebar): one row from 20rem of room, stacked below it — the swap then turns
  // * to point up / down
  PAIR_COMPACT_FRAME: "@container/period-pair",
  PAIR_COMPACT_SWAP: "rotate-90 @min-[20rem]/period-pair:rotate-0",
  SIDE: "flex min-w-0 flex-1 flex-col gap-1.5",
  // * Period B's carries the swap button at its end; both rows stay as tall as their label
  LABEL_ROW: "flex items-center justify-between gap-2",
  EDITOR: "flex flex-col gap-2",
  // * compact: the years come after the year field (order), the DOM stays the page's
  YEARS_COMPACT: "order-last",
  YEARS: "flex flex-wrap gap-2",
  YEAR_REMOVE: "ml-0.5 opacity-60 hover:opacity-100 leading-none",
  ADD_ROW: "flex items-center gap-2",
  ADD_BUTTON: `${FORM_CONTROL_CLASSES.HEIGHT} shrink-0 px-3 text-[length:var(--font-base)]`,
  ADD_BUTTON_COMPACT: `${FORM_CONTROL_CLASSES.HEIGHT} shrink-0 px-3 text-[length:var(--font-sm)]`,
} as const;

export const YEAR_INPUT_CLASS = `${FORM_CONTROL_CLASSES.INPUT} text-[length:var(--font-base)]`;

// * a compared year's badge: neutral — its shape names it, never a colour
export const YEAR_BADGE_TONE = {
  bg: "var(--color-surface-secondary)",
  border: "var(--color-border)",
  text: "var(--color-text)",
} as const;

// * each side of Compare Periods' pair: its place, label, shape and test ids
export const PERIOD_PAIR_SIDES = [
  {
    side: EPairSide.A,
    index: 0,
    labelKey: "climateComparison.periodA",
    shape: getPairShape(EWalterLiethSeriesId.A),
    testId: "period-a",
  },
  {
    side: EPairSide.B,
    index: 1,
    labelKey: "climateComparison.periodB",
    shape: getPairShape(EWalterLiethSeriesId.B),
    testId: "period-b",
  },
] as const;
