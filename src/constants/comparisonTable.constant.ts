import { EDifferenceMeaning } from "@/enums";
import type { TComparisonMetric, TComparisonMetricFormat } from "@/types";

/** The rows in order, each with its unit and decimals; the Martonne row gets its class badge. */
export const COMPARISON_METRICS: readonly TComparisonMetricFormat[] = [
  { metric: "meanTemp", unit: "celsius", digits: 1 },
  { metric: "avgTmax", unit: "celsius", digits: 1 },
  { metric: "avgTmin", unit: "celsius", digits: 1 },
  { metric: "annualPrec", unit: "mm", digits: 0 },
  { metric: "aridMonths", unit: null, digits: 0 },
  { metric: "frostMonths", unit: null, digits: 0 },
  { metric: "altitude", unit: "meters", digits: 0 },
  { metric: "martonne", unit: null, digits: 1 },
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

// * the difference header's explanation of its formula and sign, by what the pair compares
export const DIFFERENCE_NOTE_KEYS: Record<EDifferenceMeaning, string> = {
  [EDifferenceMeaning.CITIES]: "climateComparison.differenceNote.cities",
  [EDifferenceMeaning.PERIODS]: "climateComparison.differenceNote.periods",
};
