import type { ReactNode } from "react";
import type { EPopoverVariant } from "@/enums";

export type TPopoverProps = {
  trigger: ReactNode;
  label: string;
  variant?: EPopoverVariant;
  children: ReactNode;
};
