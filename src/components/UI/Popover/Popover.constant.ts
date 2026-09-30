import { FOCUS_RING_CLASS } from "@/constants";

export const POPOVER_CLASSES = {
  ROOT: "relative",
  // * a 44 px touch target below `sm`, compact beside the controls above it
  BUTTON: `${FOCUS_RING_CLASS} inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-xs)] px-1.5 text-[length:var(--font-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:text-[var(--color-text)] sm:min-h-7`,
  PANEL:
    "absolute right-0 top-full z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-left text-[length:var(--font-sm)] text-[var(--color-text)] shadow-md",
} as const;
