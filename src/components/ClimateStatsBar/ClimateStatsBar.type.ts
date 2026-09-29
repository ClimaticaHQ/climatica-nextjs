import type { TMartonneBadge, TStatDeltas } from "@/types";
import type { ReactNode } from "react";

export type TComparisonEntity = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
  color: string;
};

export type TClimateStatsBarProps = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
  comparison?: TComparisonEntity;
  primaryColor?: string;
  /** series B's difference from A, shown under the values */
  deltas?: TStatDeltas | undefined;
  /** inside a panel card: no frame of its own, only dividers between cells */
  isInPanel?: boolean;
};

export type TStatsBarStyle = {
  bar: string;
  cell: string;
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

/** One metric: a plain value, or A / B in compare mode. */
export type TStatValueProps = {
  a: string;
  b?: string | undefined;
  aColor: string;
  bColor?: string | undefined;
};

export type TMartonneBadgeProps = {
  badge: TMartonneBadge;
};
