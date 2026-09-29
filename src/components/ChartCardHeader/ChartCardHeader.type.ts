import type { ReactNode } from "react";

export type TChartCardHeaderProps = {
  /** title block — may wrap (clamped by the title itself) */
  title: ReactNode;
  /** toggles and chips — kept on one row, beside the title or below it */
  controls: ReactNode;
};
