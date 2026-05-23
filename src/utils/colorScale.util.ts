import { TColorScale, TColorStop } from "@/types";

// * 9-stop RdYlBu diverging scale: blue (cold) → red (hot)
const TEMP_STOPS: TColorStop[] = [
  { t: 0, hex: "#4575B4" },
  { t: 0.125, hex: "#74ADD1" },
  { t: 0.25, hex: "#ABD9E9" },
  { t: 0.375, hex: "#E0F3F8" },
  { t: 0.5, hex: "#FEE090" },
  { t: 0.625, hex: "#FDAE61" },
  { t: 0.75, hex: "#F46D43" },
  { t: 0.875, hex: "#D73027" },
  { t: 1, hex: "#A50026" },
];

// * Sequential brown scale for precipitation: low=light, high=dark
const PREC_STOPS: TColorStop[] = [
  { t: 0, hex: "#FFF7BC" },
  { t: 0.33, hex: "#FEC44F" },
  { t: 0.67, hex: "#D95F0E" },
  { t: 1, hex: "#993404" },
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function interpolateStops(stops: TColorStop[], t: number): string {
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

export function interpolateColor(
  value: number,
  min: number,
  max: number,
  scale: TColorScale,
): string {
  const t = max === min ? 0.5 : (value - min) / (max - min);
  return interpolateStops(scale === "precipitation" ? PREC_STOPS : TEMP_STOPS, t);
}

export function getColorStops(scale: TColorScale): TColorStop[] {
  return scale === "precipitation" ? [...PREC_STOPS] : [...TEMP_STOPS];
}
