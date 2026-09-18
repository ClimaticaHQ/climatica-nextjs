import { WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TMonthAridity, TMonthlyTemperature, TWalterLiethScales } from "@/types";

const { PREC_BREAKPOINT, LINEAR_RATIO, COMPRESSED_RATIO } = WALTER_LIETH_DIAGRAM;

export function precToScaled(prec: number): number {
  if (prec <= PREC_BREAKPOINT) {
    return prec / LINEAR_RATIO;
  }
  return PREC_BREAKPOINT / LINEAR_RATIO + (prec - PREC_BREAKPOINT) / COMPRESSED_RATIO;
}

export function scaledToPrec(scaled: number): number {
  const breakScaled = PREC_BREAKPOINT / LINEAR_RATIO; // 50

  if (scaled <= breakScaled) {
    return scaled * LINEAR_RATIO;
  }
  return PREC_BREAKPOINT + (scaled - breakScaled) * COMPRESSED_RATIO;
}

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

// * Raw-mm tick values for the piecewise right axis — fine steps below the
// * breakpoint, coarser steps above it. Pixel positions come from running
// * each value through precToScaled() elsewhere; these are the tick labels.
export function computeWLPrecAxisTicks(precMax: number): number[] {
  const ticks: number[] = [];
  for (let v = 0; v <= Math.min(precMax, PREC_BREAKPOINT); v += 20) ticks.push(v);
  for (let v = PREC_BREAKPOINT + 100; v <= precMax; v += 100) ticks.push(v);
  return ticks;
}

export function getWalterLiethScales(data: TMonthlyTemperature[]): TWalterLiethScales {
  const tavgs = data.map((d) => (d.tmin + d.tmax) / 2);
  const rawTempMin = Math.min(...tavgs.map((t, i) => Math.min(t, data[i].tmin)));
  const rawTempMax = Math.max(...tavgs.map((t, i) => Math.max(t, data[i].tmax)));

  // * Round outward to nearest 5 for clean axis ticks
  const tempMin = Math.floor(rawTempMin / 5) * 5;
  const tempMax = Math.ceil(rawTempMax / 5) * 5;

  // * precMax now tracks actual precipitation (piecewise-scaled, then rounded
  // * outward to 5 in scaled space) instead of assuming precip = temp × 2.
  const rawPrecMax = Math.max(...data.map((d) => d.prec));
  const precMax = Math.ceil(precToScaled(rawPrecMax) / 5) * 5;

  // * precMin never crosses the compression breakpoint (precip is never
  // * negative), so it stays linear — same zero as the temp axis, ratio 2.
  const precMin = tempMin * 2;

  // * The actual domain ceiling for drawing curves (shared by both the temp
  // * and precip curves, since precip is plotted through the temp scale).
  // * tempMax itself stays untouched so temperature tick labels never show
  // * a meaningless high value just because precipitation was tall.
  const plotMax = Math.max(tempMax, precMax);

  return { tempMin, tempMax, precMin, precMax, plotMax };
}
