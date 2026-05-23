import type { TWorldClimAvgBoxBinding, TWorldClimBoxBinding } from "@/types";
import { CELL_SIZE_OPTIONS, GRID_DELTA, MONTH_NAMES } from "@/constants";
import { iriToCellBounds } from "@/utils";
import type { TCellBounds, TCellSize } from "@/types";
import type {
  THeatmapStats,
  TLooseBinding,
  TPolygon,
  TRegionalProfile,
  TSumAndCount,
} from "./HeatMap.type";

export { GRID_DELTA, iriToCellBounds };
export type { TCellBounds, TCellSize };

/** Candidate key sets — SPARQL variable names are API-defined; fallbacks cover naming variants */
const KEY_SETS = [
  Array.from({ length: 12 }, (_, i) => `valueMonth${String(i + 1).padStart(2, "0")}`), // valueMonth01..12
  Array.from({ length: 12 }, (_, i) => `valueMonth${i + 1}`), // valueMonth1..12
  Array.from({ length: 12 }, (_, i) => `value${String(i + 1).padStart(2, "0")}`), // value01..12
  Array.from({ length: 12 }, (_, i) => `value${i + 1}`), // value1..12
  Array.from({ length: 12 }, (_, i) => `vm${String(i + 1).padStart(2, "0")}`), // vm01..12
  Array.from({ length: 12 }, (_, i) => `vm${i + 1}`), // vm1..12
  Array.from({ length: 12 }, (_, i) => `v${String(i + 1).padStart(2, "0")}`), // v01..12
  Array.from({ length: 12 }, (_, i) => `v${i + 1}`), // v1..12
  Array.from({ length: 12 }, (_, i) => `month${String(i + 1).padStart(2, "0")}`), // month01..12
  Array.from({ length: 12 }, (_, i) => `month${i + 1}`), // month1..12
];

function extractNumber(raw: unknown): number {
  if (raw === undefined || raw === null) return NaN;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") return parseFloat(raw);
  if (typeof raw === "object") {
    const v = (raw as Record<string, unknown>)["value"];
    if (typeof v === "number") return v;
    if (typeof v === "string") return parseFloat(v);
  }
  return NaN;
}

function readMonthlySumAndCount(binding: TLooseBinding): TSumAndCount {
  for (const keys of KEY_SETS) {
    const first = binding[keys[0]];
    if (first !== undefined) {
      let sum = 0;
      let count = 0;
      for (const k of keys) {
        const n = extractNumber(binding[k]);
        if (!isNaN(n)) {
          sum += n;
          count++;
        }
      }
      return { sum, count };
    }
  }
  return { sum: 0, count: 0 };
}

export function pixelAnnualAvg(binding: TWorldClimBoxBinding): number {
  const { sum, count } = readMonthlySumAndCount(binding as TLooseBinding);
  return count > 0 ? sum / count : NaN;
}

export function pixelSelectedAvg(binding: TWorldClimBoxBinding, selectedMonths: number[]): number {
  if (selectedMonths.length === 0) return pixelAnnualAvg(binding);
  const loose = binding as TLooseBinding;
  for (const keys of KEY_SETS) {
    if (loose[keys[0]] === undefined) continue;
    const sum = selectedMonths.reduce((s, m) => {
      const n = extractNumber(loose[keys[m - 1]]);
      return s + (isNaN(n) ? 0 : n);
    }, 0);
    return sum / selectedMonths.length;
  }
  return 0;
}

export function computeHeatmapStats(pixelBindings: TWorldClimBoxBinding[]): THeatmapStats {
  const values = pixelBindings.map(pixelAnnualAvg).filter((v) => !isNaN(v));

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, stdDev: 0, count: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const lo = sorted[mid - 1] ?? 0;
  const hi = sorted[mid] ?? 0;
  const median = sorted.length % 2 === 0 ? (lo + hi) / 2 : hi;

  const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length);

  return { min, max, avg, median, stdDev, count: values.length };
}

function extractMonthlyNums(binding: TWorldClimAvgBoxBinding | null): number[] {
  if (!binding) return Array.from({ length: 12 }, () => NaN);
  return Array.from({ length: 12 }, (_, i) => {
    const key = `valueMonth${String(i + 1).padStart(2, "0")}`;
    return extractNumber((binding as Record<string, unknown>)[key]);
  });
}

export function computeRegionalProfile(
  tmax: TWorldClimAvgBoxBinding | null,
  tmin: TWorldClimAvgBoxBinding | null,
  prec: TWorldClimAvgBoxBinding | null,
): TRegionalProfile | null {
  const tmaxVals = extractMonthlyNums(tmax);
  const tminVals = extractMonthlyNums(tmin);
  const precVals = extractMonthlyNums(prec);

  const tavgVals = tmaxVals.map((mx, i) => {
    const mn = tminVals[i];
    return !isNaN(mx) && mn !== undefined && !isNaN(mn) ? (mx + mn) / 2 : NaN;
  });

  const validTavg = tavgVals.filter((v) => !isNaN(v));
  const validPrec = precVals.filter((v) => !isNaN(v));

  if (validTavg.length === 0 || validPrec.length === 0) return null;

  const meanTemp = validTavg.reduce((s, v) => s + v, 0) / validTavg.length;
  const annualPrecip = Math.round(validPrec.reduce((s, v) => s + v, 0));

  const aridMonths = tavgVals.filter((tavg, i) => {
    const p = precVals[i];
    return !isNaN(tavg) && p !== undefined && !isNaN(p) && p < 2 * tavg;
  }).length;

  const martonneIndex = meanTemp + 10 > 0 ? annualPrecip / (meanTemp + 10) : null;

  return { meanTemp, annualPrecip, aridMonths, martonneIndex };
}

export function gridDelta(gridSize: string): number {
  return GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];
}

/** lng lat order in WKT spec — note the inversion from the [lat, lng] input */
export function polygonToWkt(vertices: [number, number][]): string {
  const ring = [...vertices, vertices[0]];
  const coords = ring.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `POLYGON((${coords}))`;
}

/** Inverse of polygonToWkt — returns null for invalid WKT */
export function wktToPolygon(wkt: string): TPolygon | null {
  const match = /^POLYGON\(\((.+)\)\)$/i.exec(wkt);
  if (!match) return null;
  const pairs = match[1].split(",").map((s) => s.trim().split(/\s+/));
  // WKT is lng lat; drop closing vertex (duplicate of first)
  const vertices = pairs.slice(0, -1).map(([lng, lat]) => {
    return [Number(lat), Number(lng)] as [number, number];
  });
  if (vertices.length < 3) return null;
  if (vertices.some(([lat, lng]) => isNaN(lat) || isNaN(lng))) return null;
  return vertices;
}

/** "2.5 min" from "2.5 min (~20.25 km²)" */
export function shortGridLabel(gridSize: TCellSize): string {
  return CELL_SIZE_OPTIONS[gridSize]?.split(" (~")[0] ?? gridSize;
}

/**
 * Returns a short month string for the summary bar.
 * [] → ""   [2] → "Feb"   [1,2,3] → "Jan, Feb, Mar"   [1..6] → "6 months"
 */
export function formatSelectedMonths(selectedMonths: number[]): string {
  if (selectedMonths.length === 0) return "";
  if (selectedMonths.length <= 3)
    return selectedMonths.map((m) => MONTH_NAMES[m - 1].slice(0, 3)).join(", ");
  return `${selectedMonths.length} months`;
}
