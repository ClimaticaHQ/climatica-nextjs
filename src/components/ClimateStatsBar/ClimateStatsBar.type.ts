export type TClimateStatsBarProps = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  altitude?: number;
  martonneIndex: number | null;
  /** the one weather year the stats describe — the Martonne cell names it */
  martonneYear?: number | undefined;
};
