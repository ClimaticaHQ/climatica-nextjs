import type {
  TBbox,
  TCellSize,
  TChartSubtitle,
  TClimatePeriod,
  TDataset,
  TLocale,
  TVariable,
} from "@/types";

/** Built from state directly — window.location can briefly lag the latest city/filter change. */
export type TBuildShareableUrlParams = {
  locale: TLocale;
  cityName: string;
  lat: number;
  lng: number;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  subtitle: TChartSubtitle;
};

/** Mirrors ComparePeriods.tsx's own URL-sync effect param set. */
export type TBuildComparePeriodsShareUrlParams = {
  locale: TLocale;
  cityName: string;
  lat: number;
  lng: number;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  dataset: TDataset;
  climatePeriodA: TClimatePeriod;
  climatePeriodB: TClimatePeriod;
  weatherPeriods: number[];
};

/** Mirrors CompareCities.tsx's own URL-sync effect param set. */
export type TBuildCompareCitiesShareUrlParams = {
  locale: TLocale;
  cityAName: string;
  latA: number;
  lngA: number;
  cityBName: string;
  latB: number;
  lngB: number;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  subtitle: TChartSubtitle;
};

/** Mirrors HeatMap.tsx's own URL-sync effect param set. */
export type TBuildHeatMapShareUrlParams = {
  locale: TLocale;
  gridSize: TCellSize;
  variables: readonly TVariable[];
  subtitle: TChartSubtitle;
  bbox: TBbox | null;
  polygonWkt: string | null;
};
