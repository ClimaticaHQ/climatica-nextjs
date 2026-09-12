import type { TLinearScale, TMonthBand } from "@/types";

/** Maps a numeric domain to a pixel range — inverted range (max→rangeMin) gives a proper SVG y-axis. */
export function createLinearScale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): TLinearScale {
  const domainSpan = domainMax - domainMin;
  if (domainSpan === 0) return () => (rangeMin + rangeMax) / 2;
  return (value: number) => rangeMin + ((value - domainMin) / domainSpan) * (rangeMax - rangeMin);
}

/** Equal-width categorical band for a given month index (0-11) across the plot width. */
export function monthBandX(index: number, plotWidth: number, monthCount = 12): TMonthBand {
  const bandWidth = plotWidth / monthCount;
  const x = index * bandWidth;
  return { x, width: bandWidth, center: x + bandWidth / 2 };
}
