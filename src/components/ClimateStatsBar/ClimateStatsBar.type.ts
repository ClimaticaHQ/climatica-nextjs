export type TComparisonEntity = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
  color: string;
};

export type TDualValueProps = {
  a: string;
  b: string;
  aColor: string;
  bColor: string;
};

export type TClimateStatsBarProps = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
  comparison?: TComparisonEntity;
  primaryColor?: string;
};
