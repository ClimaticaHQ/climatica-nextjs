import { FOCUS_RING_CLASS } from "@/constants";
import { ETextScale } from "@/enums";

const ACTIVE_BG = "bg-[var(--color-chip-active-bg)]";
const ACTIVE_BORDER = "border-[var(--color-chip-active-border)]";
const ACTIVE_TEXT = "text-[var(--color-chip-active-text)]";
// * through colours, never opacity, so a selected one keeps its cue; WCAG 1.4.3 exempts disabled controls
export const DISABLED_LOOK =
  "border-[var(--color-border-disabled)] bg-[var(--color-surface)] text-[var(--color-text-disabled)]";
export const DISABLED_SELECTED_LOOK =
  "border-[var(--color-chip-disabled-selected-border)] bg-[var(--color-chip-disabled-selected-bg)] text-[var(--color-chip-disabled-selected-text)]";

export const TOGGLE_CHIP_CLASSES = {
  BASE: `${FOCUS_RING_CLASS} whitespace-nowrap rounded-full border font-medium transition-colors duration-150`,
  DISABLED: `cursor-not-allowed ${DISABLED_LOOK}`,
  DISABLED_SELECTED: `cursor-not-allowed ${DISABLED_SELECTED_LOOK}`,
  LOCKED: `cursor-not-allowed ${ACTIVE_BORDER} ${ACTIVE_BG} ${ACTIVE_TEXT}`,
  ACTIVE: `cursor-pointer ${ACTIVE_BORDER} ${ACTIVE_BG} ${ACTIVE_TEXT}`,
  // * the hover classes written out whole: Tailwind only generates classes it finds as text
  IDLE: "cursor-pointer border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-chip-active-border)] hover:text-[var(--color-chip-active-text)]",
  LABEL_WITH_MARKER: "inline-flex items-center gap-1.5",
} as const;

export const TOGGLE_CHIP_SCALE_CLASSES: Record<ETextScale, string> = {
  [ETextScale.DEFAULT]:
    "touch-target px-2.5 py-1 text-[length:var(--font-base)] leading-[var(--leading-base)]",
  [ETextScale.TOUCH]:
    "px-2.5 py-1 text-[length:var(--font-base)] leading-[var(--leading-base)] max-lg:relative max-lg:inline-flex max-lg:h-[max(2.25rem,36px)] max-lg:items-center max-lg:px-3.5 max-lg:py-0 max-lg:text-[length:var(--font-touch-chip)] max-lg:before:absolute max-lg:before:inset-x-[min(0px,calc((100%-44px)/2))] max-lg:before:-inset-y-[5px] max-lg:before:content-['']",
};

export const BAR_CHIP_CLASSES = {
  BUTTON:
    "group flex min-h-target shrink-0 items-center rounded-[var(--radius-full)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]",
  PILL: "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-full)] border px-3 text-[length:var(--font-sm)] font-medium transition-colors duration-150",
  DEFAULT:
    "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] group-hover:border-[var(--color-chip-active-border)]",
  CHANGED:
    "border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]",
  ALL: "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]",
  DISABLED: DISABLED_LOOK,
  BADGE:
    "inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-on-primary)] px-1 text-[length:var(--font-xs)] font-semibold text-[var(--color-primary)]",
  ALL_LABEL: "hidden min-[22.5rem]:inline",
  ICON: "h-4 w-4",
} as const;
