import {
  CELL_SIZES,
  CELLS_PER_DEGREE,
  POINT_CELL_EDGE_MARGIN_DEG,
  POINT_QUERY_PARAMS,
  WORLDCLIM_POINT_QUERY_IDS,
  WORLDCLIM_VARIABLE_BASE,
} from "@/constants";
import type { TCellSize, TCoordinates, TPointCacheParts, TPointCell } from "@/types";
import { buildGridIri } from "./worldclim.util";

const { LAT, LNG, GRID, VAR, IS_CLIMATE, IS_WEATHER, YEAR } = POINT_QUERY_PARAMS;
const YEAR_REGEX = /^\d{4}$/;
const LATITUDE_SPAN = 180;
const LONGITUDE_SPAN = 360;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function isNearEdge(index: number, perDegree: number): boolean {
  const fraction = index - Math.floor(index);
  return Math.min(fraction, 1 - fraction) / perDegree < POINT_CELL_EDGE_MARGIN_DEG;
}

export function pointToCell({ lat, lng }: TCoordinates, size: TCellSize): TPointCell | null {
  const perDegree = CELLS_PER_DEGREE[size];
  const y = (90 - lat) * perDegree;
  const x = (lng + 180) * perDegree;
  if (isNearEdge(y, perDegree) || isNearEdge(x, perDegree)) return null;

  const row = Math.floor(y);
  const col = Math.floor(x);
  const isInside =
    row >= 0 && row < LATITUDE_SPAN * perDegree && col >= 0 && col < LONGITUDE_SPAN * perDegree;
  return isInside ? { size, row, col } : null;
}

function hasOnly(params: URLSearchParams, allowed: readonly string[]): boolean {
  return [...params.keys()].every((key) => allowed.includes(key));
}

function readSingle(params: URLSearchParams, name: string): string | null {
  const values = params.getAll(name);
  return values.length === 1 ? (values[0] ?? null) : null;
}

function readPoint(params: URLSearchParams): TCoordinates | null {
  const lat = Number(readSingle(params, LAT) ?? NaN);
  const lng = Number(readSingle(params, LNG) ?? NaN);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function readDataset(params: URLSearchParams): string | null {
  const isClimate = readSingle(params, IS_CLIMATE) === "true" && !params.has(IS_WEATHER);
  if (isClimate && !params.has(YEAR)) return "climate";

  const year = readSingle(params, YEAR);
  const isWeather = readSingle(params, IS_WEATHER) === "true" && !params.has(IS_CLIMATE);
  return isWeather && year !== null && YEAR_REGEX.test(year) ? `weather:${year}` : null;
}

function buildPixelValuesParts(params: URLSearchParams): TPointCacheParts | null {
  const allowed = [LAT, LNG, GRID, VAR, IS_CLIMATE, IS_WEATHER, YEAR];
  const point = readPoint(params);
  const grid = readSingle(params, GRID);
  const size = Object.values(CELL_SIZES).find((candidate) => buildGridIri(candidate) === grid);
  const variables = params.getAll(VAR);
  const dataset = readDataset(params);
  const hasKnownVariables =
    variables.length > 0 && variables.every((iri) => iri.startsWith(WORLDCLIM_VARIABLE_BASE));
  if (!hasOnly(params, allowed) || !point || !size || !hasKnownVariables || !dataset) return null;

  const cell = pointToCell(point, size);
  if (!cell) return null;
  // * sorted: the same variables in another order are the same answer
  const names = variables.map((iri) => iri.slice(WORLDCLIM_VARIABLE_BASE.length)).sort();
  return {
    queryId: WORLDCLIM_POINT_QUERY_IDS.PIXEL_VALUES,
    cell,
    variant: `${names.join(",")}:${dataset}`,
    expectedCells: [cell],
  };
}

/** cellofpoint answers every grid at once: the key is the finest cell, which sits in one cell of each */
function buildCellParts(params: URLSearchParams): TPointCacheParts | null {
  const point = readPoint(params);
  if (!hasOnly(params, [LAT, LNG]) || !point) return null;

  const cells = Object.values(CELL_SIZES).map((size) => pointToCell(point, size));
  const expectedCells = cells.filter((cell): cell is TPointCell => cell !== null);
  const finest = pointToCell(point, CELL_SIZES.THIRTY_SECONDS);
  if (!finest || expectedCells.length !== cells.length) return null;
  return { queryId: WORLDCLIM_POINT_QUERY_IDS.CELL, cell: finest, variant: null, expectedCells };
}

const POINT_PARTS_BUILDERS: Record<string, (params: URLSearchParams) => TPointCacheParts | null> = {
  [WORLDCLIM_POINT_QUERY_IDS.PIXEL_VALUES]: buildPixelValuesParts,
  [WORLDCLIM_POINT_QUERY_IDS.CELL]: buildCellParts,
};

export function buildPointCacheParts(
  queryId: string,
  params: URLSearchParams,
): TPointCacheParts | null {
  return POINT_PARTS_BUILDERS[queryId]?.(params) ?? null;
}

const cellIriSuffix = ({ size, row, col }: TPointCell) => `/Cell_${size}_r${row}c${col}`;

export function isAnswerForCells(data: unknown, expectedCells: readonly TPointCell[]): boolean {
  const results = isRecord(data) ? data["results"] : null;
  const bindings = isRecord(results) ? results["bindings"] : null;
  if (!Array.isArray(bindings) || bindings.length === 0) return false;

  const suffixes = expectedCells.map(cellIriSuffix);
  return bindings.every((binding: unknown) => {
    const cell = isRecord(binding) ? binding["cell"] : null;
    const iri = isRecord(cell) ? cell["value"] : null;
    return typeof iri === "string" && suffixes.some((suffix) => iri.endsWith(suffix));
  });
}
