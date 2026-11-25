import type { EBottomSheetHeight } from "@/enums";
import type { ReactNode } from "react";

export type TBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  height?: EBottomSheetHeight;
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
