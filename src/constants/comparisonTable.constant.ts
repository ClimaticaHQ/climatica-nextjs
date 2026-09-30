import type { TComparisonMetric, TComparisonMetricFormat } from "@/types";

/** The rows in order, each with its unit and decimals; the Martonne row gets its class badge. */
export const COMPARISON_METRICS: readonly TComparisonMetricFormat[] = [
  { metric: "meanTemp", unit: "°C", digits: 1 },
  { metric: "avgTmax", unit: "°C", digits: 1 },
  { metric: "avgTmin", unit: "°C", digits: 1 },
  { metric: "annualPrec", unit: "mm", digits: 0 },
  { metric: "aridMonths", unit: "", digits: 0 },
  { metric: "frostMonths", unit: "", digits: 0 },
  { metric: "altitude", unit: "m", digits: 0 },
  { metric: "martonne", unit: "", digits: 1 },
];

// * the i18n key of each row's label
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

// * "Lviv − Valladolid": the difference's direction, with a real minus
export const DIFFERENCE_DIRECTION_SEPARATOR = " − ";
