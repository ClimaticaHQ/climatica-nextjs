import {
  ARC_UNITS,
  COPYRIGHT,
  CELL_SIZES,
  CELLS_PER_DEGREE,
  CLIMATE_PERIODS,
  DATASETS,
  EQUATOR_KM_PER_DEGREE,
  FILTER_DEFAULTS,
  GRID_DELTA,
} from "@/constants";
import { EDisplayMetric, EFilterKey } from "@/enums";
import type { TCellSize, TCopyrightYearsArgs, TGridArc, TResolutionRow } from "@/types";
import { isGridSizeOffered } from "./filters.util";

/**
 * A person's initials for an avatar: the first letters of their first two words — the given
 * name and the first surname, as Spanish names read ("Pablo García Zarza" → "PG").
 */
export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

/** The copyright's years: the first release to now, one year while they're the same. */
export function formatCopyrightYears({ firstYear, currentYear }: TCopyrightYearsArgs) {
  return currentYear > firstYear
    ? `${firstYear}${COPYRIGHT.YEARS_SEPARATOR}${currentYear}`
    : String(firstYear);
}

/** A grid's resolution as an angle — arc-seconds below a minute (30″), else arc-minutes (2.5′). */
export function getGridArc(size: TCellSize): TGridArc {
  const seconds = ARC_UNITS.SECONDS_PER_DEGREE / CELLS_PER_DEGREE[size];
  return seconds < ARC_UNITS.SECONDS_PER_MINUTE
    ? { value: seconds, symbol: ARC_UNITS.SECOND_SYMBOL, metric: EDisplayMetric.ARC_SECONDS }
    : {
        value: seconds / ARC_UNITS.SECONDS_PER_MINUTE,
        symbol: ARC_UNITS.MINUTE_SYMBOL,
        metric: EDisplayMetric.ARC_MINUTES,
      };
}

/** A grid cell's side at the equator, in km. */
export function getCellSizeKm(size: TCellSize) {
  return (GRID_DELTA[size] ?? 0) * EQUATOR_KM_PER_DEGREE;
}

/**
 * The resolutions table, coarsest first, with where each grid exists — asked of the filters'
 * own rule (isGridSizeOffered), so the page can't tell a different story from the selector.
 */
export function getResolutionRows(): TResolutionRow[] {
  return Object.values(CELL_SIZES).map((size) => ({
    size,
    cellSizeKm: getCellSizeKm(size),
    climatePeriods: Object.values(CLIMATE_PERIODS).filter((climatePeriod) =>
      isGridSizeOffered(size, { dataset: DATASETS.CLIMATE, climatePeriod }),
    ),
    hasWeather: isGridSizeOffered(size, {
      dataset: DATASETS.WEATHER,
      climatePeriod: FILTER_DEFAULTS[EFilterKey.CLIMATE_PERIOD],
    }),
  }));
}
