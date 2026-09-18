import type { TChartSummary, TMonthAridity, TMonthlyTemperature } from "@/types";

export function computeChartSummary(
  data: TMonthlyTemperature[],
  aridity: TMonthAridity[],
): TChartSummary {
  const annualAvgTemp = aridity.reduce((s, m) => s + m.tavg, 0) / aridity.length;
  const totalPrec = Math.round(data.reduce((s, d) => s + d.prec, 0));
  const denominator = annualAvgTemp + 10;
  const martonne = denominator > 0 ? totalPrec / denominator : null;

  return {
    annualAvgTemp,
    totalPrec,
    aridCount: aridity.filter((m) => m.isArid).length,
    martonne,
  };
}
