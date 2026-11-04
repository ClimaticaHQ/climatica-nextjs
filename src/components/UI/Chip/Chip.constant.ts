import { FOCUS_RING_CLASS } from "@/constants";
import { ETextScale } from "@/enums";

const ACTIVE_BG = "bg-[var(--color-chip-active-bg)]";
const ACTIVE_BORDER = "border-[var(--color-chip-active-border)]";
const ACTIVE_TEXT = "text-[var(--color-chip-active-text)]";
// * every chip's disabled look, at every size and breakpoint, through colours (never opacity, so
// * a selected one can keep its cue): the unselected chip's surface, with text and border at
// * MD2's disabled emphasis. No hover. Not a contrast target (WCAG 1.4.3 exempts disabled
// * controls) — the note under it explains, at full contrast
export const DISABLED_LOOK =
  "border-[var(--color-border-disabled)] bg-[var(--color-surface)] text-[var(--color-text-disabled)]";
// * disabled but selected (the variables a Walter-Lieth diagram draws): the selected tints at
// * reduced emphasis, still apart from an unselected disabled chip
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

// * a toggle chip's size per text scale — only its text and the spacing around it. TOUCH below
// * lg: the desktop chip scaled up evenly — 15 px text in a 36 px pill, 14 px each side — and a
// * transparent ::before reaching 4 px past the pill above and below (5 px from the padding edge,
// * inside the 1 px border), so the tap target is 44 px. Chips sit 8 px apart (gap-2), so
// * neighbouring targets meet but never overlap
export const TOGGLE_CHIP_SCALE_CLASSES: Record<ETextScale, string> = {
  [ETextScale.DEFAULT]: "px-2.5 py-1 text-sm",
  [ETextScale.TOUCH]:
    "px-2.5 py-1 text-sm max-lg:relative max-lg:inline-flex max-lg:h-9 max-lg:items-center max-lg:px-3.5 max-lg:py-0 max-lg:text-[length:var(--font-touch-chip)] max-lg:before:absolute max-lg:before:inset-x-0 max-lg:before:-inset-y-[5px] max-lg:before:content-['']",
};

// * a filter bar chip is a ≥44px-tall button (the touch target); the pill inside is what shows
export const BAR_CHIP_CLASSES = {
  BUTTON:
    "group flex min-h-11 shrink-0 items-center rounded-[var(--radius-full)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]",
  PILL: "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-full)] border px-3 text-[length:var(--font-sm)] font-medium transition-colors duration-150",
  DEFAULT:
    "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] group-hover:border-[var(--color-chip-active-border)]",
  CHANGED:
    "border-[var(--color-chip-active-border)] bg-[var(--color-chip-active-bg)] text-[var(--color-chip-active-text)]",
  ALL: "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]",
  // * not changeable in this view, yet tappable — it opens the explanation
  DISABLED: DISABLED_LOOK,
  BADGE:
    "inline-flex h-5 min-w-5 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-on-primary)] px-1 text-[length:var(--font-xs)] font-semibold text-[var(--color-primary)]",
  // * the "Filters" label shows from 360px up; below it, icon and badge only
  ALL_LABEL: "hidden min-[360px]:inline",
  ICON: "h-4 w-4",
} as const;
