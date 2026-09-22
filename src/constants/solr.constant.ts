// * Relative Solr query-field boosts: the matched/requested language's field always
// * wins, "en" keeps a secondary boost as the most useful fallback for place names
// * (unless "en" itself is the matched language), and every other supported locale
// * shares a flat baseline weight.
export const SOLR_SEARCH_WEIGHTS = {
  PRIMARY_LABEL: 25,
  SECONDARY_LABEL: 12,
  OTHER_LABEL: 8,
  PRIMARY_NGRAM: 3,
  OTHER_NGRAM: 1,
  PRIMARY_PHRASE: 40,
  SECONDARY_PHRASE: 20,
  OTHER_PHRASE: 15,
} as const;

export const SOLR_SECONDARY_LANG = "en";
