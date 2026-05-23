import type { TMonthlyTemperature } from "@/types";
import type { TClimateStats } from "./ClimateStatistics.type";

export type { TClimateStats };

export function toCityQueryParam(cityLabel: string) {
  return cityLabel.trim().toLowerCase();
}

export function formatCoordinate(value: number) {
  return value.toFixed(4);
}

export function computeClimateStats(
  data: TMonthlyTemperature[],
  months?: number[] | null,
): TClimateStats {
  const filtered =
    months && months.length > 0 ? data.filter((d) => months.includes(d.month)) : data;

  const count = filtered.length;
  const avgTmax =
    count > 0 ? (filtered.reduce((sum, d) => sum + d.tmax, 0) / count).toFixed(1) : "—";
  const avgTmin =
    count > 0 ? (filtered.reduce((sum, d) => sum + d.tmin, 0) / count).toFixed(1) : "—";
  const totalPrec = count > 0 ? filtered.reduce((sum, d) => sum + d.prec, 0).toFixed(0) : "—";

  return { avgTmax, avgTmin, totalPrec };
}
