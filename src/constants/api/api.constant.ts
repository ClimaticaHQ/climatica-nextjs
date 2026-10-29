export const ENDPOINTS = {
  WIKIDATA: "https://www.wikidata.org/w/api.php",
} as const;

export const WORLDCLIM_UPSTREAM_BASE = "https://scrapi.gsic.uva.es/apis/worldclim";

/** What a route handler answers when an upstream service fails — never 200, never cached */
export const API_ERRORS = {
  WORLDCLIM_UNAVAILABLE: { status: 502, message: "WorldClim API request failed" },
  CITY_SEARCH_UNAVAILABLE: { status: 503, message: "City search is unavailable" },
  REVERSE_GEOCODING_UNAVAILABLE: { status: 502, message: "Reverse geocoding failed" },
} as const;

/** A data response's X-Cache value: answered from Redis, fetched upstream and cached, or never cached */
export const CACHE_STATUS = { HIT: "HIT", MISS: "MISS", BYPASS: "BYPASS" } as const;

export const CACHE_STATUS_HEADER = "X-Cache";
export const SERVER_TIMING_HEADER = "Server-Timing";
export const SERVER_TIMING_DECIMALS = 1;

// * Server-Timing metric names: the service a route waited on
export const UPSTREAM_SOURCES = {
  SOLR: "solr",
  WIKIDATA: "wikidata",
  WORLDCLIM: "worldclim",
} as const;
