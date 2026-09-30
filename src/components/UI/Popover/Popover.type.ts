import type { ReactNode } from "react";

export type TPopoverProps = {
  /** the button's visible content */
  trigger: ReactNode;
  /** the panel's accessible name */
  label: string;
  children: ReactNode;
};
