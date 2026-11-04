import {
  SOLR_FUZZY_EDITS,
  SOLR_LOCATION_FIELDS,
  SOLR_NEAREST_PLACE,
  SOLR_POPULATION_LOG,
  SOLR_QUERY_PARAMS as P,
  SOLR_RANKING,
  SOLR_SEARCH_FIELDS,
  SOLR_SEARCH_WEIGHTS,
  SOLR_SPECIAL_CHARACTERS,
  SOLR_FUZZY_WORD_SEPARATOR,
} from "@/constants";
import type { TCoordinates } from "@/types";
import { parseLocale } from "./locale.util";

/** Edits a word of this many characters may have in the typo-tolerant clause: 0, 1 or 2. */
export function getFuzzyEdits(word: string): number {
  const length = [...word].length;
  return SOLR_FUZZY_EDITS.find(({ minLength }) => length >= minLength)?.edits ?? 0;
}

/** A word as a fuzzy term: escaped, then `~N` when it's long enough to allow edits. */
export function toFuzzyTerm(word: string): string {
  const escaped = word.replace(SOLR_SPECIAL_CHARACTERS, "\\$&");
  const edits = getFuzzyEdits(word);
  return edits > 0 ? `${escaped}~${edits}` : escaped;
}

/** The fuzzy clause's text: every word, split on whitespace and hyphens, as a fuzzy term. */
export function toFuzzyText(text: string): string {
  return text
    .split(SOLR_FUZZY_WORD_SEPARATOR)
    .filter((word) => word !== "")
    .map(toFuzzyTerm)
    .join(" ");
}

const populationBoost = (weight: number) => `product(${weight},${SOLR_POPULATION_LOG})`;

/**
 * The /cities query: two clauses on every search name of a city, either of which may match.
 * An exact/prefix match (whole names, names typed halfway, the reader's label in their locale)
 * scores its relevance plus a tier above any typo match, plus population; a typo-only match
 * (names within one or two edits) scores its closeness plus a smaller population boost. Every
 * ranking rule is sent here, so the handler's defaults don't shape the order.
 */
export function buildSolrQueryParams(query: string, lang: string): URLSearchParams {
  const text = query.trim();
  const uiLocale = parseLocale(lang);
  const { NAMES, NAMES_PREFIX, LABEL_PREFIX } = SOLR_SEARCH_FIELDS;
  const { NAMES: NAMES_WEIGHT, LABEL, NAMES_PHRASE, FUZZY_NAMES } = SOLR_SEARCH_WEIGHTS;
  const { MIN_MATCH, SORT, EXACT_TIER, EXACT_POPULATION_WEIGHT, FUZZY_POPULATION_WEIGHT } =
    SOLR_RANKING;
  const exactRank = `sum(${EXACT_TIER},${populationBoost(EXACT_POPULATION_WEIGHT)})`;
  const fuzzyRank = `sum(query($${P.FUZZY}),${populationBoost(FUZZY_POPULATION_WEIGHT)})`;

  return new URLSearchParams({
    defType: P.DEF_TYPE,
    sort: SORT,
    q: `{!bool filter=$${P.MATCH} should=$${P.EXACT} should=$${P.RANK}}`,
    [P.MATCH]: `{!bool should=$${P.EXACT} should=$${P.FUZZY}}`,
    // * bf='': population is boosted once, in the rank clause, whatever the handler's defaults
    [P.EXACT]: `{!edismax qf=$${P.EXACT_QF} pf=$${P.EXACT_PF} mm=$${P.MIN_MATCH} bf='' v=$${P.EXACT_TEXT}}`,
    [P.FUZZY]: `{!edismax qf=$${P.FUZZY_QF} pf='' mm=$${P.MIN_MATCH} bf='' v=$${P.FUZZY_TEXT}}`,
    [P.RANK]: `{!func}if(query($${P.EXACT}),${exactRank},${fuzzyRank})`,
    [P.MIN_MATCH]: MIN_MATCH,
    [P.EXACT_TEXT]: text,
    [P.EXACT_QF]: [
      NAMES_PREFIX,
      `${NAMES}^${NAMES_WEIGHT}`,
      `${LABEL_PREFIX}${uiLocale}^${LABEL}`,
    ].join(" "),
    [P.EXACT_PF]: `${NAMES}^${NAMES_PHRASE}`,
    [P.FUZZY_TEXT]: toFuzzyText(text),
    [P.FUZZY_QF]: [`${NAMES}^${FUZZY_NAMES}`, NAMES_PREFIX].join(" "),
  });
}

/**
 * The nearest-place query: the populated place nearest the point within RADIUS_KM. A box on the
 * coordinate fields narrows the candidates; the distance filter keeps the radius a circle and
 * the sort picks the nearest. None of it is cached: every point is its own filter. A box crossing
 * the antimeridian stops at ±180°, so a place just across it isn't found.
 */
export function buildNearestPlaceParams({ lat, lng }: TCoordinates): URLSearchParams {
  const { RADIUS_KM, EARTH_RADIUS_KM, KM_PER_DEGREE, MAX_LNG_DELTA, COORDINATE_DECIMALS } =
    SOLR_NEAREST_PLACE;
  const { LAT, LNG } = SOLR_LOCATION_FIELDS;
  const fixed = (value: number) => value.toFixed(COORDINATE_DECIMALS);
  const latDelta = RADIUS_KM / KM_PER_DEGREE;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const lngDelta = Math.min(MAX_LNG_DELTA, latDelta / Math.max(cosLat, Number.EPSILON));
  const distance = `hsin(${EARTH_RADIUS_KM},true,${LAT},${LNG},${fixed(lat)},${fixed(lng)})`;

  const params = new URLSearchParams({
    defType: "lucene",
    q: "*:*",
    // * geonameid: the same answer for two places at the same distance, whatever the index order
    sort: `${distance} asc, geonameid asc`,
    rows: "1",
  });
  params.append(
    "fq",
    `{!cache=false}${LAT}:[${fixed(lat - latDelta)} TO ${fixed(lat + latDelta)}]`,
  );
  params.append(
    "fq",
    `{!cache=false}${LNG}:[${fixed(lng - lngDelta)} TO ${fixed(lng + lngDelta)}]`,
  );
  params.append(
    "fq",
    `{!frange u=${RADIUS_KM} cache=false cost=${SOLR_NEAREST_PLACE.POST_FILTER_COST}}${distance}`,
  );
  return params;
}
