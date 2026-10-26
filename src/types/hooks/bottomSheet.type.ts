import type { RefObject } from "react";

export type TFocusTrapOptions = {
  containerRef: RefObject<HTMLElement | null>;
  /** while true, focus is inside the container; when it turns false, focus goes back */
  isActive: boolean;
};

export type TSwipeToCloseOptions = {
  /** a drag left over from the last time resets when this turns true */
  isEnabled: boolean;
  thresholdPx: number;
  onClose: () => void;
};

export type TSheetHistoryOptions = {
  isOpen: boolean;
  /** closes the sheet's UI — called once its history entry is gone */
  onClose: () => void;
};

/** A promise and the function settling it. */
export type TDeferred = {
  promise: Promise<void>;
  resolve: () => void;
};
