import type { EBottomSheetHeight } from "@/enums";
import type { ReactNode } from "react";

export type TBottomSheetProps = {
  isOpen: boolean;
  /** asked to close — Escape, the backdrop, the close button, a swipe down */
  onClose: () => void;
  title: string;
  height?: EBottomSheetHeight;
  /** pinned below the scrolling content, e.g. an Apply button */
  footer?: ReactNode;
  children: ReactNode;
};

export type TBottomSheetBackdropProps = {
  isLeaving: boolean;
  onClick: () => void;
};

export type TBottomSheetHeaderProps = {
  title: string;
  titleId: string;
  onClose: () => void;
};
