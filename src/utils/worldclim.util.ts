import {
  CELL_IRI_ROW_COL_REGEX,
  CELL_SIZE_OPTIONS,
  CLIMATE_PERIODS,
  CLIMATE_VARIABLES,
  MONTH_NAMES,
  WORLDCLIM_GRID_BASE,
  WORLDCLIM_RASTER_BASE,
  WORLDCLIM_VARIABLE_BASE,
} from "@/constants";
import { env } from "@/libs/Env";
import type {
  TCellBounds,
  TCellSize,
  TClimatePeriod,
  TFullVariableMonthRow,
  TMonthlyTemperature,
  TRawAvgValueBinding,
  TRawPixelValueBinding,
  TSparqlUriValue,
  TSparqlValue,
  TVariable,
  TWorldClimAvgBoxBinding,
  TWorldClimBoxBinding,
  TWorldClimCellResponse,
  TWorldClimPixelResource,
  TWorldClimPointValueBinding,
} from "@/types";

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

/** "2.5 min" from "2.5 min (~20.25 km²)" */
export function shortGridLabel(gridSize: TCellSize): string {
  return CELL_SIZE_OPTIONS[gridSize]?.split(" (~")[0] ?? gridSize;
}

export function buildVariableIris(variables: readonly string[]): string[] {
  return variables.map((v) => `${WORLDCLIM_VARIABLE_BASE}${v}`);
}

/** Mirrors the raster IRI shape SCRAPI names rasters with: "Raster_{grid}_{variable}_{period}",
 * where period is a climate period (already "c1970-2000"-shaped) or "w{year}" for weather. */
export function buildRasterIri(
  gridSize: TCellSize,
  variable: TVariable,
  period: TClimatePeriod | number,
): string {
  const periodSuffix = typeof period === "number" ? `w${period}` : period;
  return `${WORLDCLIM_RASTER_BASE}${gridSize}_${variable}_${periodSuffix}`;
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

/** null means no bindings matched (e.g. this grid has no raster for the
 * requested period) — callers must treat that as "unavailable", not zero. */
export function buildMonthlyTemperaturesFromPointValues(
  bindings: TWorldClimPointValueBinding[],
): TMonthlyTemperature[] | null {
  if (bindings.length === 0) return null;

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
    // * a value the response lacks stays null — 0 would be read as real data
    tmin: vals.get(`tmin_${i + 1}`) ?? null,
    tmax: vals.get(`tmax_${i + 1}`) ?? null,
    prec: vals.get(`prec_${i + 1}`) ?? null,
  }));
}

/** SCRAPI's climate point-value endpoint returns every period's rasters
 * together — this narrows to the one the caller actually wants. */
export function filterPointBindingsByPeriod(
  bindings: TWorldClimPointValueBinding[],
  period: TClimatePeriod,
): TWorldClimPointValueBinding[] {
  return bindings.filter((b) => b.raster.value.includes(period));
}

/** Which climate periods this specific grid/point combination actually has
 * rasters for — e.g. Grid_30s only ever has c1970-2000. */
export function extractAvailableClimatePeriods(
  bindings: TWorldClimPointValueBinding[],
): TClimatePeriod[] {
  const present = new Set(
    bindings
      .map((b) => Object.values(CLIMATE_PERIODS).find((period) => b.raster.value.includes(period)))
      .filter((period): period is TClimatePeriod => period !== undefined),
  );
  return Object.values(CLIMATE_PERIODS).filter((period) => present.has(period));
}

/**
 * Same Map-walk as buildMonthlyTemperaturesFromPointValues, but keeps every
 * variable present in the bindings instead of narrowing to tmin/tmax/prec —
 * for the "raw" export, which requests all of CLIMATE_VARIABLES from SCRAPI.
 */
export function extractAllVariablesFromPointValues(
  bindings: TWorldClimPointValueBinding[],
): TFullVariableMonthRow[] {
  const vals = new Map<string, number>();

  for (const b of bindings) {
    const varParts = b.var.value.split("Variable_");
    const varName = varParts[varParts.length - 1] ?? "";
    const monthNum = parseInt(b.month.value.replace("--", ""), 10);
    vals.set(`${varName}_${monthNum}`, Number(b.value.value));
  }

  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const row: TFullVariableMonthRow = { month, monthName: MONTH_NAMES[i] };
    for (const variable of CLIMATE_VARIABLES) {
      const value = vals.get(`${variable}_${month}`);
      if (value !== undefined) row[variable] = value;
    }
    return row;
  });
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
  const map = new Map<
    string,
    { cell: TSparqlUriValue | undefined; months: Map<number, TSparqlValue> }
  >();

  for (const b of raw) {
    const iri = b.pixel?.value;
    if (!iri) continue;
    const monthNum = parseGMonth(b.month?.value);
    if (monthNum === null) continue;
    if (!map.has(iri)) map.set(iri, { cell: b.cell, months: new Map() });
    map.get(iri)!.months.set(monthNum, b.value);
  }

  const result: TWorldClimBoxBinding[] = [];
  for (const [iri, { cell, months }] of map) {
    const binding: Record<string, unknown> = { pixel: { type: "uri", value: iri }, cell };
    for (const [m, v] of months) {
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
