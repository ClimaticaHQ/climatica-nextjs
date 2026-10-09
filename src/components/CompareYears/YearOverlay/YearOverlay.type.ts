import type { TYearOption } from "@/types";
import type { ReactNode } from "react";

export type TYearOverlayProps = {
  years: readonly TYearOption[];
  shown: readonly number[];
  onShownChange: (years: readonly number[]) => void;
  /** under the year chips: the chart's own chips (the standard chart's variables) */
  controls?: ReactNode;
  /** the diagram of the shown years — the highlighted one (null: none) drawn in front */
  renderDiagram: (highlighted: number | null) => ReactNode;
};
