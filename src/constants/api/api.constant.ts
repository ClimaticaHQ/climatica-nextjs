export const WORLDCLIM_UPSTREAM_BASE = "https://scrapi.gsic.uva.es/apis/worldclim";

/** never 200, never cached */
export const API_ERRORS = {
  WORLDCLIM_UNAVAILABLE: { status: 502, message: "WorldClim API request failed" },
  CITY_SEARCH_UNAVAILABLE: { status: 503, message: "City search is unavailable" },
  REVERSE_GEOCODING_UNAVAILABLE: { status: 502, message: "Reverse geocoding failed" },
} as const;

export const CACHE_STATUS = { HIT: "HIT", MISS: "MISS", BYPASS: "BYPASS" } as const;

export const CACHE_STATUS_HEADER = "X-Cache";
export const SERVER_TIMING_HEADER = "Server-Timing";
export const SERVER_TIMING_DECIMALS = 1;

export const UPSTREAM_SOURCES = {
  SOLR: "solr",
  WORLDCLIM: "worldclim",
} as const;
