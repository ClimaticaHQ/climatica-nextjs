import type { TCitySearchParams, TNearestCityParams, TPointCacheParts } from "@/types";
import { TIME } from "./time.constant";

export const THRESHOLDS = {
  POPULAR_CITY: 10,
  POPULAR_CLIMATE: 5,
};

export const CACHE_TTL = {
  CITY_SEARCH_SHORT: TIME.IN_SECONDS.DAY,
  CITY_SEARCH: TIME.IN_SECONDS.SEVEN_DAYS,
  POPULAR_CITY: TIME.IN_SECONDS.THIRTY_DAYS,
  NEAREST_CITY: TIME.IN_SECONDS.SEVEN_DAYS,

  CLIMATE_DATA: TIME.IN_SECONDS.SEVEN_DAYS,
  POPULAR_CLIMATE: TIME.IN_SECONDS.THIRTY_DAYS,
} as const;

export const CACHE_KEYS = {
  CITY_SEARCH: (dto: TCitySearchParams) =>
    `city-search:${dto.lang}:${dto.query.toLowerCase().trim()}`,
  CITY_SEARCH_COUNTER: (dto: TCitySearchParams) =>
    `city-search-counter:${dto.lang}:${dto.query.toLowerCase().trim()}`,

  NEAREST_CITY_SEARCH: (dto: TNearestCityParams) =>
    `nearest-city:${dto.lang}:${dto.lat.toFixed(4)}:${dto.lng.toFixed(4)}`,

  WORLDCLIM_RESOURCE: (searchParams: string) => `worldclim-resource:${searchParams}`,
  WORLDCLIM_RESOURCE_COUNTER: (searchParams: string) =>
    `worldclim-resource-counter:${searchParams}`,

  WORLDCLIM_QUERY: (queryId: string, searchParams: string) =>
    `worldclim-query:${queryId}:${searchParams}`,
  WORLDCLIM_QUERY_COUNTER: (queryId: string, searchParams: string) =>
    `worldclim-query-counter:${queryId}:${searchParams}`,

  WORLDCLIM_POINT: ({ queryId, cell, variant }: TPointCacheParts) =>
    `worldclim-point:${queryId}:${cell.size}:r${cell.row}c${cell.col}${variant ? `:${variant}` : ""}`,
  WORLDCLIM_POINT_COUNTER: ({ queryId, cell, variant }: TPointCacheParts) =>
    `worldclim-point-counter:${queryId}:${cell.size}:r${cell.row}c${cell.col}${variant ? `:${variant}` : ""}`,
} as const;

/** not connection errors (ECONNREFUSED, ETIMEDOUT): a forced reconnect would reset retryStrategy's backoff */
export const RECOVERABLE_REDIS_ERRORS = new Set([
  "READONLY",
  "LOADING",
  "MASTERDOWN",
  "CLUSTERDOWN",
]);
