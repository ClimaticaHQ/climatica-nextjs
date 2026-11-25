import {
  ARC_UNITS,
  COPYRIGHT,
  INFO_PAGES,
  CELL_SIZES,
  CELLS_PER_DEGREE,
  CLIMATE_PERIODS,
  DATASETS,
  EQUATOR_KM_PER_DEGREE,
  FILTER_DEFAULTS,
  FULL_VARIABLES_CLIMATE_PERIOD,
  GRID_DELTA,
  REFERENCE_LINKS,
} from "@/constants";
import { EDisplayMetric, EFilterKey } from "@/enums";
import type {
  TCellSize,
  TCopyrightYearsArgs,
  TGridArc,
  TReferenceLink,
  TReferenceLinkArgs,
  TResolutionRow,
} from "@/types";
import { getFinestGridSize, isGridSizeOffered } from "./filters.util";

export function isInfoRoute(pathname: string) {
  return INFO_PAGES.some(({ route }) => route === pathname);
}

/** the given name and the first surname, as Spanish names read */
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

export function formatCopyrightYears({ firstYear, currentYear }: TCopyrightYearsArgs) {
  return currentYear > firstYear
    ? `${firstYear}${COPYRIGHT.YEARS_SEPARATOR}${currentYear}`
    : String(firstYear);
}

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

export function getCellSizeKm(size: TCellSize) {
  return (GRID_DELTA[size] ?? 0) * EQUATOR_KM_PER_DEGREE;
}

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

export function getFinestGridSizeBeyondFullPeriod(): TCellSize {
  const otherNormals = Object.values(CLIMATE_PERIODS)
    .filter((climatePeriod) => climatePeriod !== FULL_VARIABLES_CLIMATE_PERIOD)
    .map((climatePeriod) => ({ dataset: DATASETS.CLIMATE, climatePeriod }));
  return getFinestGridSize([
    ...otherNormals,
    { dataset: DATASETS.WEATHER, climatePeriod: FULL_VARIABLES_CLIMATE_PERIOD },
  ]);
}

export function getScholarSearchUrl(title: string) {
  return `${REFERENCE_LINKS.SCHOLAR_SEARCH_URL}${encodeURIComponent(`"${title}"`)}`;
}

export function getReferenceLink({ url, title }: TReferenceLinkArgs): TReferenceLink | null {
  if (url !== undefined) {
    return {
      href: url,
      label: url.replace(REFERENCE_LINKS.DOI_PREFIX, REFERENCE_LINKS.DOI_LABEL_PREFIX),
    };
  }
  if (title !== undefined) {
    return { href: getScholarSearchUrl(title), label: REFERENCE_LINKS.SCHOLAR_LABEL };
  }
  return null;
}
