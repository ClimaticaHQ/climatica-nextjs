import type { EStatsBarItem } from "@/enums";
import type { ReactNode } from "react";
export type TClimateStatsBarProps = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
  /** the one weather year the stats describe — the Martonne cell names it */
  martonneYear?: number | undefined;
  /** annotations attached to stats (an Info figure's numbers), by item */
  markers?: Partial<Record<EStatsBarItem, ReactNode>> | undefined;
  /** the data are still loading: the cells and labels as usual, the values as placeholders */
  isPending?: boolean;
};
