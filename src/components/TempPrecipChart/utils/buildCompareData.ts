import type { TMonthlyTemperature } from "@/types";
import type { TComparePoint } from "../TempPrecipChart.type";

export function buildCompareData(
  dataA: TMonthlyTemperature[],
  dataB: TMonthlyTemperature[],
): TComparePoint[] {
  return dataA.map((a, i) => {
    const b = dataB[i] ?? { tmax: 0, tmin: 0, prec: 0 };
    return {
      month: a.month,
      monthName: a.monthName,
      tmaxA: a.tmax,
      tminA: a.tmin,
      tavgA: (a.tmax + a.tmin) / 2,
      precA: a.prec,
      tmaxB: b.tmax,
      tminB: b.tmin,
      tavgB: (b.tmax + b.tmin) / 2,
      precB: b.prec,
    };
  });
}
