import type { RefObject } from "react";

export type TFocusTrapOptions = {
  containerRef: RefObject<HTMLElement | null>;
  isActive: boolean;
};

export type TSwipeToCloseOptions = {
  isEnabled: boolean;
  thresholdPx: number;
  onClose: () => void;
};

export type TSheetHistoryOptions = {
  isOpen: boolean;
  onClose: () => void;
};

export type TDeferred = {
  promise: Promise<void>;
  resolve: () => void;
};
