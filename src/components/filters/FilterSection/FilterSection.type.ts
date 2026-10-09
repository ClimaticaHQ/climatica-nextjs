import type { EFilterAvailability } from "@/enums";
import type { ReactNode } from "react";

export type TFilterSectionProps = {
  title?: string;
  /** a disabled section explains why; the heat map greys it out as a whole */
  availability?: EFilterAvailability;
  className?: string;
  children: ReactNode;
};
