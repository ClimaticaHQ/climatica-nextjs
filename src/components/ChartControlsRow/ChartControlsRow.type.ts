import type { ReactNode } from "react";

export type TChartControlsRowProps = {
  /** room for two controls one above the other (overlay) */
  isStacked: boolean;
  children: ReactNode;
};
