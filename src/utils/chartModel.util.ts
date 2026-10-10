import { SERIES_KIND_RULES } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type { TChartModel, TChartSeries, TChartSeriesModel } from "@/types";
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

/** The Walter-Lieth identity (A green, B orange) of a series; anything but "B" draws as A. */
export function toWalterLiethSeriesId(id: string): EWalterLiethSeriesId {
  return id === EWalterLiethSeriesId.B ? EWalterLiethSeriesId.B : EWalterLiethSeriesId.A;
}

function deriveSeries(series: TChartSeries): TChartSeriesModel {
  const data = [...series.data];
  const hasData = data.length > 0;
  const chartData = withMonthlyMean(data);
  const aridity = hasData ? computeAridityPeriods(data) : null;
  const rule = SERIES_KIND_RULES[series.kind];

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
      ...(rule.usesOwnColor ? { markerColor: series.color } : {}),
      ...(series.altitude !== null ? { altitude: series.altitude } : {}),
    }),
    hasData,
  };
}

/** The precipitation axis' top: the wettest month rounded up to 10 mm, 100 mm without data. */
function getPrecipitationAxisMax(series: readonly TChartSeries[]) {
  const values = series.flatMap(({ data }) => data.map(({ prec }) => prec));
  const present = values.filter((value): value is number => value !== null);
  const max = present.length > 0 ? Math.max(...present) : 0;
  return Math.ceil(max / PREC_AXIS_STEP_MM) * PREC_AXIS_STEP_MM || DEFAULT_PREC_AXIS_MAX_MM;
}

/** Everything a chart draws, derived from its series. Pure: no React, no translations. */
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
