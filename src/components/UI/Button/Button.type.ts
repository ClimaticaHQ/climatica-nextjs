import type { ReactNode } from "react";
import { EButtonVariant } from "@/enums";

export type TButtonProps = {
  variant: EButtonVariant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  ariaLabel?: string;
};
