import { CLIMATE_COMPARISON_COLORS } from "@/constants";
import { EFilterAvailability, EFilterNoteVariant, EPairSide } from "@/enums";
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
  "hidden w-80 shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:flex";

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
  // * to point up / down, between the two
  PAIR_COMPACT_FRAME: "@container/period-pair",
  PAIR_COMPACT_SWAP: "self-center rotate-90 @min-[20rem]/period-pair:rotate-0",
  SIDE: "flex min-w-0 flex-1 flex-col gap-1.5",
  EDITOR: "flex flex-col gap-2",
  // * compact: the years come after the year field (order), the DOM stays the page's
  YEARS_COMPACT: "order-last",
  YEARS: "flex flex-wrap gap-2",
  // * a full border in the year's colour — a left-only border on a pill reads as a cut-off arc
  YEAR: "inline-flex items-center gap-1.5 rounded-[20px] border bg-[var(--color-bg-secondary)] px-3 py-1.5 text-[13px] font-medium text-[var(--color-text)]",
  YEAR_REMOVE:
    "ml-0.5 opacity-60 hover:opacity-100 leading-none text-[var(--color-text-secondary)]",
  ADD_ROW: "flex items-center gap-2",
  ADD_BUTTON: "shrink-0 px-3 py-2 text-[length:var(--font-base)]",
  ADD_BUTTON_COMPACT: "shrink-0 px-3 py-2 text-[length:var(--font-sm)]",
} as const;

export const YEAR_INPUT_CLASS =
  "w-full rounded-[var(--radius-md)] border-2 border-[var(--color-border)] px-3 py-2 text-[length:var(--font-base)] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

// * each side of Compare Periods' pair: its place, label, colour and test ids
export const PERIOD_PAIR_SIDES = [
  {
    side: EPairSide.A,
    index: 0,
    labelKey: "climateComparison.periodA",
    color: CLIMATE_COMPARISON_COLORS.A.tmax,
    testId: "period-a",
  },
  {
    side: EPairSide.B,
    index: 1,
    labelKey: "climateComparison.periodB",
    color: CLIMATE_COMPARISON_COLORS.B.tmax,
    testId: "period-b",
  },
] as const;
