export const SOLR_SEARCH_FIELDS = {
  NAMES: "names",
  NAMES_PREFIX: "names_prefix",
  LABEL_PREFIX: "label_",
} as const;

export const SOLR_SEARCH_WEIGHTS = {
  NAMES: 4,
  LABEL: 8,
  NAMES_PHRASE: 10,
  FUZZY_NAMES: 3,
} as const;

export const SOLR_FUZZY_EDITS = [
  { minLength: 8, edits: 2 },
  { minLength: 4, edits: 1 },
] as const;

// * a fuzzy term isn't tokenized: "sant-denis~2" would never match the separately indexed "saint" and "denis"
export const SOLR_FUZZY_WORD_SEPARATOR = /[\s\-\u2010\u2011]+/;

export const SOLR_SPECIAL_CHARACTERS = /[+\-&|!(){}[\]^"~*?:\\/]/g;

// * every ranking rule is sent with each query: solrconfig.xml's /cities handler holds only neutral defaults
export const SOLR_RANKING = {
  MIN_MATCH: "100%",
  // * ties go to the larger city, then the lower GeoNames id, so equal results keep their order after a reindex
  SORT: "score desc, population desc, geonameid asc",
  // * above any typo match's score plus population boost (SOLR_SCORE_BOUNDS), so an exact hit always ranks first
  EXACT_TIER: 100_000,
  EXACT_POPULATION_WEIGHT: 20,
  FUZZY_POPULATION_WEIGHT: 5,
} as const;

export const SOLR_POPULATION_LOG = "log(sum(population,1))";

// * the limits EXACT_TIER is built on, checked by a unit test
export const SOLR_SCORE_BOUNDS = {
  MAX_DOCUMENTS: 100_000_000,
  MAX_POPULATION: 100_000_000,
  MAX_QUERY_WORDS: 5,
  MAX_FUZZY_EXPANSIONS: 50,
  BM25_K1: 1.2,
} as const;

// * clauses combine by reference ({!… v=$param}), so the reader's text never becomes query syntax; never named fq, or nested parsers inherit them
export const SOLR_QUERY_PARAMS = {
  DEF_TYPE: "lucene",
  MATCH: "cityMatch",
  EXACT: "cityExact",
  FUZZY: "cityFuzzy",
  RANK: "cityRank",
  MIN_MATCH: "cityMm",
  EXACT_TEXT: "cityQ",
  EXACT_QF: "cityQf",
  EXACT_PF: "cityPf",
  FUZZY_TEXT: "cityFuzzyQ",
  FUZZY_QF: "cityFuzzyQf",
} as const;

// * no population weighting: the name describes the point shown, not the biggest town near it
export const SOLR_NEAREST_PLACE = {
  RADIUS_KM: 10,
  EARTH_RADIUS_KM: 6371,
  KM_PER_DEGREE: 111.32,
  // * near a pole cos(lat) → 0, so the box's longitude half-width is capped
  MAX_LNG_DELTA: 180,
  // * never an exponent ("1e-7") in the query
  COORDINATE_DECIMALS: 6,
  // * a non-cached filter with cost ≥ 100 runs as a post filter
  POST_FILTER_COST: 100,
} as const;

export const SOLR_LOCATION_FIELDS = { LAT: "latitude", LNG: "longitude" } as const;
