export const RESULT_STATUSES = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

export const ENDPOINTS = {
  WIKIDATA: "https://www.wikidata.org/w/api.php",
  WIKIDATA_SPARQL: "https://query.wikidata.org/sparql",
} as const;
