import { FOCUS_RING_CLASS, FORM_CONTROL_CLASSES } from "@/constants";
import { getPairShape } from "@/utils/seriesShape.util";
import { EFilterAvailability, EFilterNoteVariant, EPairSide, EWalterLiethSeriesId } from "@/enums";
import { getSwitchToStandardChartLabel } from "@/utils/chartMode.util";
import type { TFilterUnavailableActionLabels } from "./filters.type";

// * the gap has a px floor, so the touch chips' 44px targets meet but never overlap
export const FILTER_CHIP_ROW_CLASS = "flex flex-wrap gap-[max(0.5rem,8px)]";

const NOTE_TEXT = "text-[length:var(--font-xs)] max-lg:text-[length:var(--font-touch-secondary)]";

export const FILTER_NOTE_CLASSES: Record<EFilterNoteVariant, string> = {
  [EFilterNoteVariant.INFO]: `${NOTE_TEXT} text-[var(--color-text-secondary)]`,
  [EFilterNoteVariant.MUTED]:
    "text-[length:var(--font-2xs)] italic text-[var(--color-text-secondary)] max-lg:text-[length:var(--font-touch-secondary)]",
  [EFilterNoteVariant.ERROR]: `${NOTE_TEXT} text-[var(--color-error)]`,
};

export const FILTER_UNAVAILABLE_ACTION_LABELS: TFilterUnavailableActionLabels = {
  [EFilterAvailability.WALTER_LIETH]: getSwitchToStandardChartLabel,
};

export const FILTER_UNAVAILABLE_ACTION_CLASS =
  "mt-1 inline-flex items-center text-[length:var(--font-xs)] font-medium text-[var(--color-primary)] underline-offset-2 hover:underline max-lg:min-h-target max-lg:text-[length:var(--font-touch-body)]";

export const FILTER_BAR_CLASSES = {
  ROOT: "flex items-center gap-2",
  DIVIDER: "h-6 w-px shrink-0 bg-[var(--color-border)]",
} as const;

export const FILTERS_SHEET_BUTTON_CLASS =
  "min-h-target flex-1 px-4 text-[length:var(--font-base)] max-lg:text-[length:var(--font-touch-button)]";

export const FILTERS_SHEET_TEXT_CLASS =
  "text-[length:var(--font-base)] text-[var(--color-text-secondary)] max-lg:text-[length:var(--font-touch-body)]";

export const RESOLUTION_HELP_LINK_CLASS = `${FOCUS_RING_CLASS} self-start rounded-[var(--radius-xs)] text-[length:var(--font-xs)] font-medium text-[var(--color-primary)] underline-offset-2 hover:underline max-lg:inline-flex max-lg:min-h-target max-lg:items-center max-lg:text-[length:var(--font-touch-body)]`;

export const RESOLUTION_LABEL_CLASS =
  "mb-2 text-[length:var(--font-xs)] leading-[var(--leading-xs)] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] max-lg:text-[length:var(--font-touch-label)] max-lg:tracking-[var(--touch-label-tracking)]";

export const COMPARED_PERIODS_CLASSES = {
  YEAR_FRAME: "inline-flex rounded-[var(--radius-full)]",
  // * both copies are always rendered, each shown at its width by CSS alone
  PAGE: "w-full max-w-xl lg:hidden",
  PAIR_COMPACT_FRAME: "@container/period-pair",
  PAIR_COMPACT_SWAP: "rotate-90 @min-[20rem]/period-pair:rotate-0",
  // * px floors, so the shared gap holds at a smaller text size
  SIDE: "flex min-w-0 flex-1 flex-col gap-[max(0.375rem,6px)] [--touch-room-top:max(calc(var(--spacing)*0.75),3px)]",
  LABEL_ROW:
    "flex items-center justify-between gap-2 [--touch-room-top:calc(var(--spacing)*2.5)] [--touch-room-bottom:max(calc(var(--spacing)*0.75),3px)]",
  EDITOR: "flex flex-col gap-2",
  YEARS_COMPACT: "order-last",
  YEARS: "flex flex-wrap gap-2",
  YEAR_REMOVE: "ml-0.5 opacity-60 hover:opacity-100 leading-none",
  ADD_ROW: "flex items-center gap-2",
  ADD_BUTTON: `${FORM_CONTROL_CLASSES.HEIGHT} shrink-0 px-3 text-[length:var(--font-base)]`,
  ADD_BUTTON_COMPACT: `${FORM_CONTROL_CLASSES.HEIGHT} shrink-0 px-3 text-[length:var(--font-sm)]`,
} as const;

// * 16 px below lg: iOS Safari zooms into a focused field under 16 px
export const YEAR_INPUT_CLASS = `${FORM_CONTROL_CLASSES.INPUT} text-[length:var(--font-base)] max-lg:text-[length:var(--font-touch-body)]`;

// * neutral: its shape names it, never a colour
export const YEAR_BADGE_TONE = {
  bg: "var(--color-surface-secondary)",
  border: "var(--color-border)",
  text: "var(--color-text)",
} as const;

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

export const COMPARED_PERIODS_TEST_ID_PREFIX = {
  PAGE: "page",
  SIDEBAR: "sidebar",
} as const;
