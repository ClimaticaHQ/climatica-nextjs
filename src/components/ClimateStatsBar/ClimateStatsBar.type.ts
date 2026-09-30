import type { ReactNode } from "react";

export type TClimateStatsBarProps = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
};

export type TStatCellProps = {
  label: string;
  /** full name for assistive tech when the visible label is shortened */
  fullLabel?: string;
  title?: string;
  children: ReactNode;
  /** reserve the meta row (badge / delta) so values align across bars; it may stay empty */
  hasMetaRow: boolean;
  meta?: ReactNode;
  cellClassName: string;
};

export type TStatValueProps = {
  value: string;
};
