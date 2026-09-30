import { MISSING_VALUE_LABEL } from "@/constants";
import { meanOf, sumOf } from "@/utils/monthlyClimate.util";
import { formatNumber } from "@/utils/numberFormat.util";
import type { TClimateStats, TComputeClimateStatsArgs } from "./ClimateStatistics.type";

export type { TClimateStats };

export function toCityQueryParam(cityLabel: string) {
  return cityLabel.trim().toLowerCase();
}

export function formatCoordinate(value: number) {
  return value.toFixed(4);
}

export function computeClimateStats({
  data,
  months,
  locale,
}: TComputeClimateStatsArgs): TClimateStats {
  const filtered =
    months && months.length > 0 ? data.filter((d) => months.includes(d.month)) : data;

  // * unknown ("—") when no month is selected or any selected month lacks the value
  const format = (value: number | null, digits: number) =>
    filtered.length > 0 ? formatNumber(value, { locale, digits }) : MISSING_VALUE_LABEL;
  const avgTmax = format(meanOf(filtered.map((d) => d.tmax)), 1);
  const avgTmin = format(meanOf(filtered.map((d) => d.tmin)), 1);
  const totalPrec = format(sumOf(filtered.map((d) => d.prec)), 0);

  return { avgTmax, avgTmin, totalPrec };
}
