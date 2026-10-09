export const RESULT_STATUSES = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

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
