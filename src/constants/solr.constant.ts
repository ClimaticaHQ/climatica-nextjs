// * the /cities handler's search fields: every name of a city (any locale), their word
// * beginnings for a name typed halfway, and the reader's display label
export const SOLR_SEARCH_FIELDS = {
  NAMES: "names",
  NAMES_PREFIX: "names_prefix",
  LABEL_PREFIX: "label_",
} as const;

// * Relative boosts over the unboosted prefix field: a whole name beats a prefix, the name the
// * reader sees in their own language beats a name in another one, and the words typed in
// * order (pf) beat both. FUZZY_NAMES: a typo on a whole name beats a typo on a prefix.
export const SOLR_SEARCH_WEIGHTS = {
  NAMES: 4,
  LABEL: 8,
  NAMES_PHRASE: 10,
  FUZZY_NAMES: 3,
} as const;

// * edits allowed in a word of the typo-tolerant clause, by the word's length (longest first);
// * a word under the shortest length gets none: one edit in "rom" would match half the index
export const SOLR_FUZZY_EDITS = [
  { minLength: 8, edits: 2 },
  { minLength: 4, edits: 1 },
] as const;

// * splits the reader's text into words for the fuzzy clause: whitespace and hyphens (ASCII,
// * Unicode hyphen, non-breaking hyphen). A fuzzy term isn't tokenized, so "sant-denis~2" would
// * be one term against the separately indexed "saint" and "denis" and never match.
export const SOLR_FUZZY_WORD_SEPARATOR = /[\s\-\u2010\u2011]+/;

// * Lucene query syntax characters, escaped in a word before `~N` is appended
export const SOLR_SPECIAL_CHARACTERS = /[+\-&|!(){}[\]^"~*?:\\/]/g;

// * Every ranking rule the app relies on is sent with each query; the /cities handler in
// * solrconfig.xml holds only neutral defaults (rows, echoParams, df, defType).
export const SOLR_RANKING = {
  // * every word typed must match, in both clauses: "san jose" doesn't return every "San …"
  MIN_MATCH: "100%",
  // * ties (equal scores) go to the larger city, then the lower GeoNames id, so the order of
  // * equal results doesn't depend on where a reindex happened to put them
  SORT: "score desc, population desc, geonameid asc",
  // * added to every exact/prefix match, above any typo match's score plus population boost
  // * (SOLR_SCORE_BOUNDS), so an exact hit always ranks first
  EXACT_TIER: 100_000,
  // * the population boost's weight: in the exact tier, as the handler's bf always had it; in
  // * the typo tier lower, so how close a name is matters more than how large the city is
  EXACT_POPULATION_WEIGHT: 20,
  FUZZY_POPULATION_WEIGHT: 5,
} as const;

// * log10 of a city's population (+1, so a population of 0 scores 0)
export const SOLR_POPULATION_LOG = "log(sum(population,1))";

// * Generous upper limits behind EXACT_TIER (checked by a unit test): an index of at most
// * MAX_DOCUMENTS cities, none above MAX_POPULATION people, typo searches of at most
// * MAX_QUERY_WORDS words, Lucene's default of MAX_FUZZY_EXPANSIONS terms per fuzzy word, and
// * BM25's k1 (a term scores at most idf × (k1 + 1))
export const SOLR_SCORE_BOUNDS = {
  MAX_DOCUMENTS: 100_000_000,
  MAX_POPULATION: 100_000_000,
  MAX_QUERY_WORDS: 5,
  MAX_FUZZY_EXPANSIONS: 50,
  BM25_K1: 1.2,
} as const;

// * The request's parameters: the top-level query combines the clauses by reference
// * ({!… v=$param}), so the reader's text is never concatenated into query syntax. Named
// * `city…` so the nested parsers don't inherit them as their own defaults (never `fq`).
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
