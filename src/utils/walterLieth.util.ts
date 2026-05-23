import type { TMonthAridity, TMonthlyTemperature, TWalterLiethScales } from "@/types";

export function computeAridityPeriods(data: TMonthlyTemperature[]): TMonthAridity[] {
  return data.map((d) => {
    const tavg = (d.tmin + d.tmax) / 2;
    return {
      month: d.month,
      isArid: tavg * 2 > d.prec,
      prec: d.prec,
      tavg,
      tmax: d.tmax,
      tmin: d.tmin,
    };
  });
}

export function computeWLAxisTicks(min: number, max: number): number[] {
  const step = max - min <= 30 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = min; v <= max; v += step) ticks.push(v);
  return ticks;
}

export function getWalterLiethScales(data: TMonthlyTemperature[]): TWalterLiethScales {
  const tavgs = data.map((d) => (d.tmin + d.tmax) / 2);
  const rawTempMin = Math.min(...tavgs.map((t, i) => Math.min(t, data[i].tmin)));
  const rawTempMax = Math.max(...tavgs.map((t, i) => Math.max(t, data[i].tmax)));

  // * Round outward to nearest 5 for clean axis ticks
  const tempMin = Math.floor(rawTempMin / 5) * 5;
  const tempMax = Math.ceil(rawTempMax / 5) * 5;

  // * Walter-Lieth standard: precip scale = temp scale × 2, both axes share the same zero
  const precMax = tempMax * 2;
  const precMin = tempMin * 2;

  return { tempMin, tempMax, precMin, precMax };
}
