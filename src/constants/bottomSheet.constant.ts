import { EBottomSheetHeight } from "@/enums";

// * the sheet pushes a history entry while open, so system back closes it — the one switch
export const BOTTOM_SHEET_HISTORY_ENABLED = true;

// * the history.state field marking the entry a sheet pushed
export const BOTTOM_SHEET_HISTORY_KEY = "__climaticaSheet";

// * px — dragging the handle / header further down than this closes the sheet on release
export const BOTTOM_SHEET_SWIPE_CLOSE_PX = 80;

// * pointer downs on these start no drag — they're the header's own controls
export const BOTTOM_SHEET_NO_DRAG_SELECTOR = "button, a, input, select, textarea";

export const BOTTOM_SHEET_HEIGHT_CLASSES: Record<EBottomSheetHeight, string> = {
  [EBottomSheetHeight.AUTO]: "max-h-[85dvh]",
  [EBottomSheetHeight.TALL]: "h-[92dvh]",
};

export const BOTTOM_SHEET_CLASSES = {
  // * above the map (Leaflet panes reach z-1000) and the top bar
  LAYER: "fixed inset-0 z-[1100]",
  BACKDROP: "absolute inset-0 bg-[var(--color-backdrop)]",
  PANEL:
    "absolute inset-x-0 bottom-0 flex flex-col rounded-t-[var(--radius-lg)] border-t border-[var(--color-border)] bg-[var(--color-bg)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] shadow-[var(--shadow-lg)] outline-none",
  DRAG_ZONE: "shrink-0 cursor-grab touch-none select-none active:cursor-grabbing",
  CONTENT: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4",
  FOOTER: "shrink-0 border-t border-[var(--color-border)] px-4 py-3",
} as const;

// * what a focus trap cycles through
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");
