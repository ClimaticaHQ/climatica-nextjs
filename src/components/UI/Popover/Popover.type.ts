import type { ReactNode } from "react";
import type { EPopoverVariant } from "@/enums";

export type TPopoverProps = {
  /** the button's visible content */
  trigger: ReactNode;
  /** the panel's accessible name; also the button's with the icon variant */
  label: string;
  variant?: EPopoverVariant;
  children: ReactNode;
};
