import "server-only";

import { CACHE_KEYS, CACHE_TTL, THRESHOLDS } from "@/constants";
import type {
  TCitySearchParams,
  TNearestCityParams,
  TPointCacheParts,
  TPopularityTtl,
} from "@/types";

const CITY_SEARCH_TTL = {
  ttl: CACHE_TTL.CITY_SEARCH,
  popularTtl: CACHE_TTL.POPULAR_CITY,
  popularThreshold: THRESHOLDS.POPULAR_CITY,
} satisfies TPopularityTtl;

const CLIMATE_TTL = {
  ttl: CACHE_TTL.CLIMATE_DATA,
  popularTtl: CACHE_TTL.POPULAR_CLIMATE,
  popularThreshold: THRESHOLDS.POPULAR_CLIMATE,
} satisfies TPopularityTtl;

export const REDIS_STRATEGIES = {
  citySearch: {
    ...CITY_SEARCH_TTL,
    shortTtl: CACHE_TTL.CITY_SEARCH_SHORT,
    buildEntry: (dto: TCitySearchParams) => ({
      ...CITY_SEARCH_TTL,
      key: CACHE_KEYS.CITY_SEARCH(dto),
      counterKey: CACHE_KEYS.CITY_SEARCH_COUNTER(dto),
    }),
  },

  worldclimResource: {
    ...CLIMATE_TTL,
    buildEntry: (searchParams: string) => ({
      ...CLIMATE_TTL,
      key: CACHE_KEYS.WORLDCLIM_RESOURCE(searchParams),
      counterKey: CACHE_KEYS.WORLDCLIM_RESOURCE_COUNTER(searchParams),
    }),
  },

  worldclimQuery: {
    ...CLIMATE_TTL,
    buildEntry: (queryId: string, searchParams: string) => ({
      ...CLIMATE_TTL,
      key: CACHE_KEYS.WORLDCLIM_QUERY(queryId, searchParams),
      counterKey: CACHE_KEYS.WORLDCLIM_QUERY_COUNTER(queryId, searchParams),
    }),
  },

  worldclimPoint: {
    ...CLIMATE_TTL,
    buildEntry: (parts: TPointCacheParts) => ({
      ...CLIMATE_TTL,
      key: CACHE_KEYS.WORLDCLIM_POINT(parts),
      counterKey: CACHE_KEYS.WORLDCLIM_POINT_COUNTER(parts),
    }),
  },

  nearestCity: {
    ttl: CACHE_TTL.NEAREST_CITY,
    buildKey: (dto: TNearestCityParams) => CACHE_KEYS.NEAREST_CITY_SEARCH(dto),
  },
} as const;
