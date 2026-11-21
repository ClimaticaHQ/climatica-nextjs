import { FOCUS_RING_CLASS, FORM_CONTROL_CLASSES } from "@/constants";
import { getPairShape } from "@/utils/seriesShape.util";
import { EFilterAvailability, EFilterNoteVariant, EPairSide, EWalterLiethSeriesId } from "@/enums";
import { getSwitchToStandardChartLabel } from "@/utils/chartMode.util";
import type { TFilterUnavailableActionLabels } from "./filters.type";

// * a filter's chips, wrapping: the gap has a px floor, so the touch chips' 44px targets meet but
// * never overlap at a smaller text size either
export const FILTER_CHIP_ROW_CLASS = "flex flex-wrap gap-[max(0.5rem,8px)]";

// * helper notes: the touch scale's secondary size below lg
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

// * a column from lg up; below lg the filters live in the filter bar's sheet
export const FILTER_BAR_CLASSES = {
  ROOT: "flex items-center gap-2",
  DIVIDER: "h-6 w-px shrink-0 bg-[var(--color-border)]",
} as const;

export const FILTERS_SHEET_BUTTON_CLASS =
  "min-h-target flex-1 px-4 text-[length:var(--font-base)] max-lg:text-[length:var(--font-touch-button)]";

// * the explanation in the Walter-Lieth info sheet
export const FILTERS_SHEET_TEXT_CLASS =
  "text-[length:var(--font-base)] text-[var(--color-text-secondary)] max-lg:text-[length:var(--font-touch-body)]";

// * the resolution selector's link to what the resolutions mean (Data & methods)
export const RESOLUTION_HELP_LINK_CLASS = `${FOCUS_RING_CLASS} self-start rounded-[var(--radius-xs)] text-[length:var(--font-xs)] font-medium text-[var(--color-primary)] underline-offset-2 hover:underline max-lg:inline-flex max-lg:min-h-target max-lg:items-center max-lg:text-[length:var(--font-touch-body)]`;

export const RESOLUTION_LABEL_CLASS =
  "mb-2 text-[length:var(--font-xs)] leading-[var(--leading-xs)] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] max-lg:text-[length:var(--font-touch-label)] max-lg:tracking-[var(--touch-label-tracking)]";

export const COMPARED_PERIODS_CLASSES = {
  // * a year's badge frame: rounded like the badge, so its arrival flash follows its outline
  YEAR_FRAME: "inline-flex rounded-[var(--radius-full)]",
  // * on the page below lg, hidden from lg (display: none) where the sidebar's copy shows: both
  // * copies are always rendered, each shown at its width by CSS alone
  PAGE: "w-full max-w-xl lg:hidden",
  // * compact (sidebar): one row from 20rem of room, stacked below it — the swap then turns
  // * to point up / down
  PAIR_COMPACT_FRAME: "@container/period-pair",
  PAIR_COMPACT_SWAP: "rotate-90 @min-[20rem]/period-pair:rotate-0",
  // * the swap and the dropdown share the gap between them, half each (px floors, so it holds at a
  // * smaller text size); the dropdown makes up the rest of its 44px target below itself
  SIDE: "flex min-w-0 flex-1 flex-col gap-[max(0.375rem,6px)] [--touch-room-top:max(calc(var(--spacing)*0.75),3px)]",
  // * Period B's carries the swap button at its end; both rows stay as tall as their label
  // * the swap's target reaches up to the space above the pair, never into the filter bar
  LABEL_ROW:
    "flex items-center justify-between gap-2 [--touch-room-top:calc(var(--spacing)*2.5)] [--touch-room-bottom:max(calc(var(--spacing)*0.75),3px)]",
  EDITOR: "flex flex-col gap-2",
  // * compact: the years come after the year field (order), the DOM stays the page's
  YEARS_COMPACT: "order-last",
  YEARS: "flex flex-wrap gap-2",
  YEAR_REMOVE: "ml-0.5 opacity-60 hover:opacity-100 leading-none",
  ADD_ROW: "flex items-center gap-2",
  ADD_BUTTON: `${FORM_CONTROL_CLASSES.HEIGHT} shrink-0 px-3 text-[length:var(--font-base)]`,
  ADD_BUTTON_COMPACT: `${FORM_CONTROL_CLASSES.HEIGHT} shrink-0 px-3 text-[length:var(--font-sm)]`,
} as const;

// * 16 px below lg: iOS Safari zooms into a focused field under 16 px
export const YEAR_INPUT_CLASS = `${FORM_CONTROL_CLASSES.INPUT} text-[length:var(--font-base)] max-lg:text-[length:var(--font-touch-body)]`;

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

// * the two copies of Compare Periods' selectors, told apart in their test ids
export const COMPARED_PERIODS_TEST_ID_PREFIX = {
  PAGE: "page",
  SIDEBAR: "sidebar",
} as const;
