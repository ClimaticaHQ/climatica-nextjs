import { MONTH_NAMES, WORLDCLIM_GRID_BASE, WORLDCLIM_VARIABLE_BASE } from "@/constants";
import { env } from "@/libs";
import type {
  TCellBounds,
  TCellSize,
  TMonthlyTemperature,
  TRawAvgValueBinding,
  TRawPixelValueBinding,
  TSparqlValue,
  TWorldClimAvgBoxBinding,
  TWorldClimBoxBinding,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPointValueBinding,
} from "@/types";

const CELL_IRI_ROW_COL_REGEX = /Pixel_[^_]+_r(\d+)c(\d+)/;

export function iriToCellBounds(iri: string, cellSize: number): TCellBounds | null {
  const match = CELL_IRI_ROW_COL_REGEX.exec(iri);

  if (!match) return null;

  const row = Number(match[1]);
  const col = Number(match[2]);

  return {
    north: 90 - row * cellSize,
    south: 90 - (row + 1) * cellSize,
    west: -180 + col * cellSize,
    east: -180 + (col + 1) * cellSize,
  };
}

export function extractCellBySize(
  response: TWorldClimCellResponse,
  size: TCellSize,
): string | null {
  return (
    response.results.bindings.find((b) => b.grid.value.includes(`Grid_${size}`))?.cell.value ?? null
  );
}

export function extractPixelIri(iris: string[], variable: string): string | null {
  return iris.find((iri) => iri.includes(`_${variable}_`)) ?? null;
}

export function buildMonthlyTemperatures(
  tminData: TWorldClimPixelResource,
  tmaxData: TWorldClimPixelResource,
  precData: TWorldClimPixelResource,
): TMonthlyTemperature[] {
  return Array.from({ length: 12 }, (_, i) => {
    const monthKey = `valueMonth${String(i + 1).padStart(2, "0")}` as keyof TWorldClimPixelResource;

    return {
      month: i + 1,
      monthName: MONTH_NAMES[i],
      tmin: Number(tminData[monthKey]),
      tmax: Number(tmaxData[monthKey]),
      prec: Number(precData[monthKey]),
    };
  });
}

export function createWorldClimAuthHeaders(): { Authorization: string } {
  return {
    Authorization: `Bearer ${env.WORLDCLIM_API_KEY}`,
  };
}

export function buildGridIri(gridSize: TCellSize): string {
  return `${WORLDCLIM_GRID_BASE}${gridSize}`;
}

export function buildVariableIris(variables: readonly string[]): string[] {
  return variables.map((v) => `${WORLDCLIM_VARIABLE_BASE}${v}`);
}

export function buildDatasetParams(
  isClimate: boolean,
  year?: number,
): { isClimate: true } | { isWeather: true; year: number } {
  if (isClimate) {
    return { isClimate: true };
  }

  return { isWeather: true, year: year ?? new Date().getFullYear() };
}

export function validateResponseData(response: { data: unknown }): void {
  if (!response.data) {
    throw new Error("No data returned from API");
  }
}

export function buildMonthlyTemperaturesFromPointValues(
  bindings: TWorldClimPointValueBinding[],
): TMonthlyTemperature[] {
  const vals = new Map<string, number>();

  for (const b of bindings) {
    const varParts = b.var.value.split("Variable_");
    const varName = varParts[varParts.length - 1] ?? "";
    const monthNum = parseInt(b.month.value.replace("--", ""), 10);
    vals.set(`${varName}_${monthNum}`, Number(b.value.value));
  }

  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: MONTH_NAMES[i],
    tmin: vals.get(`tmin_${i + 1}`) ?? 0,
    tmax: vals.get(`tmax_${i + 1}`) ?? 0,
    prec: vals.get(`prec_${i + 1}`) ?? 0,
  }));
}

/** Parses XSD gMonth "--01" → 1, "--12" → 12. Returns null if invalid. */
function parseGMonth(gMonth: string | undefined): number | null {
  if (!gMonth) return null;
  const m = parseInt(gMonth.replace(/^--/, ""), 10);
  return m >= 1 && m <= 12 ? m : null;
}

/**
 * Transforms raw per-month pixel rows from pixelvaluesinbox into one
 * TWorldClimBoxBinding per unique pixel IRI (with valueMonth01..12 populated).
 */
export function groupPixelBindings(raw: TRawPixelValueBinding[]): TWorldClimBoxBinding[] {
  const map = new Map<string, Map<number, TSparqlValue>>();

  for (const b of raw) {
    const iri = b.pixel?.value;
    if (!iri) continue;
    const monthNum = parseGMonth(b.month?.value);
    if (monthNum === null) continue;
    if (!map.has(iri)) map.set(iri, new Map());
    map.get(iri)!.set(monthNum, b.value);
  }

  const result: TWorldClimBoxBinding[] = [];
  for (const [iri, monthValues] of map) {
    const binding: Record<string, unknown> = { pixel: { type: "uri", value: iri } };
    for (const [m, v] of monthValues) {
      binding[`valueMonth${String(m).padStart(2, "0")}`] = v;
    }
    result.push(binding as TWorldClimBoxBinding);
  }
  return result;
}

/**
 * Transforms raw per-month avg rows from avgpixelvaluesinbox into one
 * TWorldClimAvgBoxBinding per unique raster IRI (with valueMonth01..12 populated).
 */
export function groupAvgBindings(raw: TRawAvgValueBinding[]): TWorldClimAvgBoxBinding[] {
  const map = new Map<string, Map<number, TSparqlValue>>();

  for (const b of raw) {
    const rasterIri = b.raster?.value ?? "unknown";
    const monthNum = parseGMonth(b.month?.value);
    if (monthNum === null) continue;
    if (!map.has(rasterIri)) map.set(rasterIri, new Map());
    map.get(rasterIri)!.set(monthNum, b.avgval);
  }

  const result: TWorldClimAvgBoxBinding[] = [];
  for (const [rasterIri, monthValues] of map) {
    const binding: Record<string, unknown> = { raster: { type: "uri", value: rasterIri } };
    for (const [m, v] of monthValues) {
      binding[`valueMonth${String(m).padStart(2, "0")}`] = v;
    }
    result.push(binding as TWorldClimAvgBoxBinding);
  }
  return result;
}
