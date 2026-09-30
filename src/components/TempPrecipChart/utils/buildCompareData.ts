import type { TComparePoint, TMonthlyTemperature } from "@/types";
import { getMonthlyMean } from "@/utils/monthlyClimate.util";

export function buildCompareData(
  dataA: TMonthlyTemperature[],
  dataB: TMonthlyTemperature[],
): TComparePoint[] {
  return dataA.map((a, i) => {
    // * a month B lacks stays null (a gap), never 0
    const b = dataB[i] ?? { tmax: null, tmin: null, prec: null };
    return {
      month: a.month,
      monthName: a.monthName,
      tmaxA: a.tmax,
      tminA: a.tmin,
      tavgA: getMonthlyMean(a),
      precA: a.prec,
      tmaxB: b.tmax,
      tminB: b.tmin,
      tavgB: getMonthlyMean(b),
      precB: b.prec,
    };
  });
}
