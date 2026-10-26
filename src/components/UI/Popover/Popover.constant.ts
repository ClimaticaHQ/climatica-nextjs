import { FOCUS_RING_CLASS } from "@/constants";
import { EPopoverVariant } from "@/enums";

export const POPOVER_CLASSES = {
  PANEL:
    "absolute right-0 top-full z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left text-[length:var(--font-sm)] font-normal text-[var(--color-text)] shadow-md",
} as const;

export const POPOVER_ROOT_CLASSES: Record<EPopoverVariant, string> = {
  [EPopoverVariant.DEFAULT]: "relative",
  // * inline-flex: no line box of its own, so the button centres on the label beside it
  // * instead of sitting on a text baseline
  [EPopoverVariant.ICON]: "relative inline-flex",
  // * min-w-0: in a flex row the trigger may shrink and truncate
  [EPopoverVariant.TEXT]: "relative min-w-0",
};

export const POPOVER_BUTTON_CLASSES: Record<EPopoverVariant, string> = {
  // * a 44 px touch target below `sm`, compact beside the controls above it
  [EPopoverVariant.DEFAULT]: `${FOCUS_RING_CLASS} inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-xs)] px-1.5 text-[length:var(--font-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text)] sm:min-h-7`,
  // * sized in em from the label's font: the icon is 1em, the button a little larger; line-height 1
  // * and a block icon leave no strut or descender space to push it off centre
  [EPopoverVariant.ICON]: `${FOCUS_RING_CLASS} inline-flex size-[1.25em] items-center justify-center p-0 leading-none rounded-[var(--radius-xs)] [&>svg]:block [&>svg]:size-[1em] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]`,
  [EPopoverVariant.TEXT]: `${FOCUS_RING_CLASS} flex min-w-0 max-w-full cursor-pointer rounded-[var(--radius-xs)] decoration-dotted underline-offset-2 hover:underline`,
};
