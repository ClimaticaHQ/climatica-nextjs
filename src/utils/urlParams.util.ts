import {
  CELL_SIZES,
  CLIMATE_PERIODS,
  CLIMATE_VARIABLES,
  DATASETS,
  SIDEBAR_PARAMS,
  WEATHER_MAX_YEAR,
  WEATHER_MIN_YEAR,
} from "@/constants";
import type { TCellSize, TClimatePeriod, TDataset, TFiltersState, TMonthFilter, TVariable, TWikidataCity } from "@/types";

const VALID_VARIABLES = new Set<string>(CLIMATE_VARIABLES);
const VALID_CELL_SIZES = new Set<string>(Object.values(CELL_SIZES));
const VALID_PERIODS = new Set<string>(Object.values(CLIMATE_PERIODS));
const VALID_DATASETS = new Set<string>(Object.values(DATASETS));

export function parseDataset(raw: string | null): TDataset | null {
  if (raw !== null && VALID_DATASETS.has(raw)) return raw as TDataset;
  return null;
}

export function parsePeriod(raw: string | null): TClimatePeriod | null {
  if (raw !== null && VALID_PERIODS.has(raw)) return raw as TClimatePeriod;
  return null;
}

export function parseYear(raw: string | null): number | null {
  if (raw === null) return null;

  const n = parseInt(raw, 10);
  if (isNaN(n) || n < WEATHER_MIN_YEAR || n > WEATHER_MAX_YEAR) return null;

  return n;
}

export function parseVars(raw: string | null): TVariable[] | null {
  if (raw === null) return null;

  const parsed = raw.split(",").filter((v) => VALID_VARIABLES.has(v)) as TVariable[];

  return parsed.length > 0 ? parsed : null;
}

export function parseCellSize(raw: string | null): TCellSize | null {
  if (raw !== null && VALID_CELL_SIZES.has(raw)) return raw as TCellSize;
  return null;
}

export function parseMonths(raw: string | null): TMonthFilter | null {
  if (raw === null) return null;
  if (raw === "all") return "all";

  const nums = raw
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);

  if (nums.length === 0) return null;

  return nums.length === 12 ? "all" : nums;
}

export function parseCoord(raw: string | null): number | null {
  if (raw === null) return null;

  const n = parseFloat(raw);

  return isNaN(n) ? null : n;
}

export function encodeVars(vars: TVariable[]): string {
  return vars.join(",");
}

export function encodeMonths(months: TMonthFilter): string {
  return months === "all" ? "all" : months.join(",");
}

export function parsePeriods(raw: string | null): number[] | null {
  if (raw === null) return null;
  const years = raw
    .split(",")
    .map((s) => parseInt(s, 10))
    .filter((n) => !isNaN(n) && n >= WEATHER_MIN_YEAR && n <= WEATHER_MAX_YEAR);
  return years.length > 0 ? years : null;
}

export function encodePeriods(years: number[]): string {
  return years.join(",");
}

export function applyUrlFiltersToStore(
  searchParams: { get(name: string): string | null },
  actions: TFiltersState["actions"],
  options?: { includeMonths?: boolean },
) {
  const ds = parseDataset(searchParams.get(SIDEBAR_PARAMS.DATASET));
  if (ds !== null) actions.setDataset(ds);

  const period = parsePeriod(searchParams.get(SIDEBAR_PARAMS.PERIOD));
  if (period !== null) actions.setClimatePeriod(period);

  const year = parseYear(searchParams.get(SIDEBAR_PARAMS.YEAR));
  if (year !== null) actions.setWeatherYear(year);

  const vars = parseVars(searchParams.get(SIDEBAR_PARAMS.VAR));
  if (vars !== null) actions.setVariables(vars);

  const grid = parseCellSize(searchParams.get(SIDEBAR_PARAMS.GRID));
  if (grid !== null) actions.setGridSize(grid);

  if (options?.includeMonths) {
    const monthFilter = parseMonths(searchParams.get(SIDEBAR_PARAMS.MONTHS));
    if (monthFilter !== null) actions.setMonths(monthFilter);
  }
}

export function createUrlParamHelpers(base: URLSearchParams): {
  set: (key: string, val: string) => void;
  delete: (key: string) => void;
  changed: boolean;
  params: URLSearchParams;
} {
  const params = new URLSearchParams(base.toString());
  let _changed = false;

  return {
    params,
    get changed() {
      return _changed;
    },
    set(key: string, val: string) {
      if (params.get(key) !== val) {
        params.set(key, val);
        _changed = true;
      }
    },
    delete(key: string) {
      if (params.has(key)) {
        params.delete(key);
        _changed = true;
      }
    },
  };
}

export function cityFromUrl(
  latRaw: string | null,
  lngRaw: string | null,
  labelRaw: string | null,
): TWikidataCity | null {
  const lat = latRaw ? Number(latRaw) : NaN;
  const lng = lngRaw ? Number(lngRaw) : NaN;
  if (isNaN(lat) || isNaN(lng)) return null;
  return {
    id: `url:${lat},${lng}`,
    label: labelRaw ?? `${lat}, ${lng}`,
    description: "",
    lat,
    lng,
  };
}
