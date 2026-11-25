import { EWalterLiethSeriesId } from "@/enums";
import type {
  TChartModel,
  TChartSeries,
  TChartSeriesModel,
  TChartViewState,
  TSplitPair,
} from "@/types";
import { computeCompareStats } from "./climateComparison.util";
import { withMonthlyMean } from "./monthlyClimate.util";
import {
  computeAridityPeriods,
  getSharedDomain,
  getWalterLiethScales,
  isCompleteSeries,
  summarizeMonths,
  toWalterLiethSeries,
} from "./walterLieth.util";

const PREC_AXIS_STEP_MM = 10;
const DEFAULT_PREC_AXIS_MAX_MM = 100;

export function toWalterLiethSeriesId(id: string): EWalterLiethSeriesId {
  return id === EWalterLiethSeriesId.B ? EWalterLiethSeriesId.B : EWalterLiethSeriesId.A;
}

function deriveSeries(series: TChartSeries): TChartSeriesModel {
  const data = [...series.data];
  const hasData = data.length > 0;
  const chartData = withMonthlyMean(data);
  const aridity = hasData ? computeAridityPeriods(data) : null;

  return {
    series,
    chartData,
    aridity,
    summary: summarizeMonths(aridity),
    stats: computeCompareStats(data),
    walterLieth: toWalterLiethSeries({
      id: toWalterLiethSeriesId(series.id),
      label: series.label,
      period: series.context,
      data: chartData,
      ...(series.year !== null ? { singleYear: series.year } : {}),
      shape: series.shape,
      ...(series.altitude !== null ? { altitude: series.altitude } : {}),
    }),
    hasData,
  };
}

function getPrecipitationAxisMax(series: readonly TChartSeries[]) {
  const values = series.flatMap(({ data }) => data.map(({ prec }) => prec));
  const present = values.filter((value): value is number => value !== null);
  const max = present.length > 0 ? Math.max(...present) : 0;
  return Math.ceil(max / PREC_AXIS_STEP_MM) * PREC_AXIS_STEP_MM || DEFAULT_PREC_AXIS_MAX_MM;
}

export function deriveChartModel(series: readonly TChartSeries[]): TChartModel {
  const derived = series.map(deriveSeries);
  const rows = series.flatMap(({ data }) => data);

  return {
    series: derived,
    scales: rows.length > 0 ? getWalterLiethScales(rows) : null,
    rightMax: getPrecipitationAxisMax(series),
    domain: getSharedDomain(derived.map(({ walterLieth }) => walterLieth).filter(isCompleteSeries)),
    hasData: derived.some(({ hasData }) => hasData),
  };
}

export function getSplitPair(model: TChartModel, viewState: TChartViewState): TSplitPair | null {
  const find = (id: string | undefined) => model.series.find(({ series }) => series.id === id);
  const picked = viewState.pair?.value;
  const first = find(picked?.[0]);
  const second = find(picked?.[1]);
  const [a, b] = first && second && first !== second ? [first, second] : model.series;
  if (a === undefined || b === undefined) return null;
  return { ids: [a.series.id, b.series.id], entries: [a, b] };
}

export function getDrawnSeries(model: TChartModel, viewState: TChartViewState) {
  const shown = viewState.shown?.value;
  return shown === undefined
    ? model.series
    : model.series.filter(({ series }) => shown.includes(series.id));
}
