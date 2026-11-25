import type { EStatsBarItem } from "@/enums";
import type { ReactNode } from "react";
export type TClimateStatsBarProps = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
  martonneYear?: number | undefined;
  markers?: Partial<Record<EStatsBarItem, ReactNode>> | undefined;
  isPending?: boolean;
};
