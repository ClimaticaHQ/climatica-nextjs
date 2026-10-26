import type { EPairLayoutVariant } from "@/enums";
import type { ReactNode } from "react";

export type TPairLayoutProps = {
  variant: EPairLayoutVariant;
  first: ReactNode;
  second: ReactNode;
  /** between the two — e.g. the swap button */
  between?: ReactNode;
};

export type TPairLayoutClasses = {
  ROOT: string;
  ROOT_WITH_BETWEEN: string;
  BETWEEN: string;
};
