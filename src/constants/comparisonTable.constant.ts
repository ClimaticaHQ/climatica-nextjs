import { EDifferenceMeaning, EDisplayMetric } from "@/enums";
import type { TComparisonMetric, TComparisonMetricFormat } from "@/types";

export const COMPARISON_METRICS: readonly TComparisonMetricFormat[] = [
  { metric: "meanTemp", unit: "celsius", display: EDisplayMetric.TEMPERATURE },
  { metric: "avgTmax", unit: "celsius", display: EDisplayMetric.TEMPERATURE },
  { metric: "avgTmin", unit: "celsius", display: EDisplayMetric.TEMPERATURE },
  { metric: "annualPrec", unit: "mm", display: EDisplayMetric.PRECIPITATION },
  { metric: "aridMonths", unit: null, display: EDisplayMetric.MONTH_COUNT },
  { metric: "frostMonths", unit: null, display: EDisplayMetric.MONTH_COUNT },
  { metric: "altitude", unit: "meters", display: EDisplayMetric.ELEVATION },
  { metric: "martonne", unit: null, display: EDisplayMetric.MARTONNE },
];

export const COMPARISON_METRIC_LABEL_KEYS: Record<TComparisonMetric, string> = {
  meanTemp: "chart.meanTemp",
  avgTmax: "climateComparison.stats.avgTmax",
  avgTmin: "climateComparison.stats.avgTmin",
  annualPrec: "chart.annualPrec",
  aridMonths: "chart.aridMonths",
  frostMonths: "climateComparison.stats.frostMonths",
  altitude: "chart.altitude",
  martonne: "chart.martonneShort",
};

export const DIFFERENCE_DIRECTION_SEPARATOR = " − ";

export const DIFFERENCE_NOTE_KEYS: Record<EDifferenceMeaning, string> = {
  [EDifferenceMeaning.CITIES]: "climateComparison.differenceNote.cities",
  [EDifferenceMeaning.PERIODS]: "climateComparison.differenceNote.periods",
};
