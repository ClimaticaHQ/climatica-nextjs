import { WALTER_LIETH_DIAGRAM } from "@/constants";
import type { TMonthAridity, TMonthlyTemperature, TWalterLiethScales } from "@/types";

const { PREC_BREAKPOINT, LINEAR_RATIO, COMPRESSED_RATIO, WIDEN_THRESHOLD_RATIO } =
  WALTER_LIETH_DIAGRAM;

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
  // * Rounds strictly outward — floor-then-add-5 rather than ceil — so a value that
  // * already lands exactly on a multiple of 5 (e.g. rawPrecMax hitting the compression
  // * breakpoint exactly, 100mm → scaled 50) still gets headroom instead of landing
  // * flush against the axis ceiling with the tallest data point touching the top edge.
  const rawPrecMax = Math.max(...data.map((d) => d.prec));
  const scaledPrecMax = precToScaled(rawPrecMax);
  const precMax = Math.floor(scaledPrecMax / 5) * 5 + 5;

  // * precMin never crosses the compression breakpoint (precip is never
  // * negative), so it stays linear — same zero as the temp axis, ratio 2.
  const precMin = tempMin * 2;

  // * The actual domain ceiling for drawing curves (shared by both the temp
  // * and precip curves, since precip is plotted through the temp scale).
  // * tempMax itself stays untouched so temperature tick labels never show
  // * a meaningless high value just because precipitation was tall.
  // * precMax ≈ 2×tempMax is the classical convention's own baseline ratio, not
  // * overflow — only widen once precMax clears that baseline by a real margin,
  // * so normal climates keep the temp curve at its full, unsquashed range.
  const plotMax = precMax > tempMax * WIDEN_THRESHOLD_RATIO ? precMax : tempMax;

  return { tempMin, tempMax, precMin, precMax, plotMax };
}
