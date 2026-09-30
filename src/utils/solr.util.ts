import { LOCALES, SOLR_SEARCH_WEIGHTS, SOLR_SECONDARY_LANG } from "@/constants";
import type { TSolrFieldWeightOptions } from "@/types";

function fieldWeight({ lang, matched, primary, secondary, rest }: TSolrFieldWeightOptions): number {
  if (lang === matched) return primary;
  if (lang === SOLR_SECONDARY_LANG && matched !== SOLR_SECONDARY_LANG) return secondary;
  return rest;
}

export function buildSolrQueryParams(query: string, lang: string): URLSearchParams {
  const matched = LOCALES.includes(lang) ? lang : SOLR_SECONDARY_LANG;
  const others = LOCALES.filter((l) => l !== matched);
  const {
    PRIMARY_LABEL,
    SECONDARY_LABEL,
    OTHER_LABEL,
    PRIMARY_NGRAM,
    OTHER_NGRAM,
    PRIMARY_PHRASE,
    SECONDARY_PHRASE,
    OTHER_PHRASE,
  } = SOLR_SEARCH_WEIGHTS;

  const qf = [
    `label_${matched}^${PRIMARY_LABEL}`,
    ...others.map(
      (lang) =>
        `label_${lang}^${fieldWeight({ lang, matched, primary: PRIMARY_LABEL, secondary: SECONDARY_LABEL, rest: OTHER_LABEL })}`,
    ),
    `label_${matched}_ngram^${PRIMARY_NGRAM}`,
    ...others.map((lang) => `label_${lang}_ngram^${OTHER_NGRAM}`),
  ].join(" ");

  const pf = [
    `label_${matched}^${PRIMARY_PHRASE}`,
    ...others.map(
      (lang) =>
        `label_${lang}^${fieldWeight({ lang, matched, primary: PRIMARY_PHRASE, secondary: SECONDARY_PHRASE, rest: OTHER_PHRASE })}`,
    ),
  ].join(" ");

  return new URLSearchParams({ q: query.trim(), qf, pf });
}
