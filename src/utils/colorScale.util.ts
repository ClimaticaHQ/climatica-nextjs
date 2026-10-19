import { COLOR_SCALE_STOPS } from "@/constants/colorScale.constant";
import type { TColorScale, TColorStop } from "@/types";

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function interpolateStops(stops: readonly TColorStop[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped <= stops[i + 1].t) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const range = hi.t - lo.t;
  const localT = range === 0 ? 0 : (clamped - lo.t) / range;
  const [r1, g1, b1] = hexToRgb(lo.hex);
  const [r2, g2, b2] = hexToRgb(hi.hex);
  const r = Math.round(r1 + (r2 - r1) * localT);
  const g = Math.round(g1 + (g2 - g1) * localT);
  const b = Math.round(b1 + (b2 - b1) * localT);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * A scale's stops with their colours read from the tokens — `style` is the document's (the live
 * map and legend) or the export palette's (a saved image).
 */
export function resolveColorScale(scale: TColorScale, style: CSSStyleDeclaration): TColorStop[] {
  return COLOR_SCALE_STOPS[scale].map(({ t, token }) => ({
    t,
    hex: style.getPropertyValue(token).trim(),
  }));
}

/** The colour of a value on a scale: its place between min and max, between the two stops around it. */
export function interpolateColor(
  value: number,
  min: number,
  max: number,
  stops: readonly TColorStop[],
): string {
  const t = max === min ? 0.5 : (value - min) / (max - min);
  return interpolateStops(stops, t);
}
