import "server-only";

import { CACHE_KEYS, CACHE_TTL, THRESHOLDS } from "@/constants";
import { TCitySearchParams, TClimateSearch, TCoordinates } from "@/types";

export const REDIS_STRATEGIES = {
  citySearch: {
    ttl: CACHE_TTL.CITY_SEARCH,
    shortTtl: CACHE_TTL.CITY_SEARCH_SHORT,
    popularTtl: CACHE_TTL.POPULAR_CITY,
    popularThreshold: THRESHOLDS.POPULAR_CITY,
    buildKey: (dto: TCitySearchParams) => CACHE_KEYS.CITY_SEARCH(dto),
    buildCounterKey: (dto: TCitySearchParams) => CACHE_KEYS.CITY_SEARCH_COUNTER(dto),
  },

  climateData: {
    ttl: CACHE_TTL.CLIMATE_DATA,
    popularTtl: CACHE_TTL.POPULAR_CLIMATE,
    popularThreshold: THRESHOLDS.POPULAR_CLIMATE,
    buildKey: (dto: TClimateSearch) => CACHE_KEYS.CLIMATE(dto),
    buildCounterKey: (dto: TCoordinates) => CACHE_KEYS.CLIMATE_COUNTER(dto),
  },

  nearestCity: {
    ttl: CACHE_TTL.NEAREST_CITY,
    buildKey: (dto: TCoordinates) => CACHE_KEYS.NEAREST_CITY_SEARCH(dto),
  },
} as const;
