import type { ReactNode } from "react";
import { EButtonVariant } from "@/enums";

export type TButtonProps = {
  variant: EButtonVariant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string | undefined;
  ariaLabel?: string;
  /** a link styled as the button (next/link): a navigation, not an action */
  href?: string;
};
