import {
  SOLR_QUERY_PARAMS as P,
  SOLR_RANKING,
  SOLR_SCORE_BOUNDS,
  SOLR_SEARCH_WEIGHTS,
} from "@/constants";
import { buildSolrQueryParams, getFuzzyEdits, toFuzzyTerm, toFuzzyText } from "@/utils/solr.util";
import { describe, expect, it } from "vitest";

describe("getFuzzyEdits", () => {
  it("allows no edits under 4 characters, 1 for 4–7, 2 for 8 or more", () => {
    expect(getFuzzyEdits("rom")).toBe(0);
    expect(getFuzzyEdits("rome")).toBe(1);
    expect(getFuzzyEdits("london1")).toBe(1);
    expect(getFuzzyEdits("valadoli")).toBe(2);
    expect(getFuzzyEdits("valadolid")).toBe(2);
  });

  it("counts characters, not UTF-16 units", () => {
    expect(getFuzzyEdits("Кийв")).toBe(1);
    expect(getFuzzyEdits("Αθινα")).toBe(1);
  });
});

describe("toFuzzyTerm", () => {
  it("leaves short words unchanged", () => {
    expect(toFuzzyTerm("kyi")).toBe("kyi");
    expect(toFuzzyTerm("rom")).toBe("rom");
  });

  it("appends the edit distance", () => {
    expect(toFuzzyTerm("londno")).toBe("londno~1");
    expect(toFuzzyTerm("barcleona")).toBe("barcleona~2");
  });

  it("escapes query syntax before the edit distance", () => {
    expect(toFuzzyTerm("a+b:c")).toBe("a\\+b\\:c~1");
    expect(toFuzzyTerm("(paris)")).toBe("\\(paris\\)~1");
    expect(toFuzzyTerm("x~2")).toBe("x\\~2");
  });
});

describe("toFuzzyText", () => {
  it("splits hyphenated words, so each part matches its own indexed token", () => {
    expect(toFuzzyText("sant-denis")).toBe("sant~1 denis~1");
    expect(toFuzzyText("stratford-upon-avon")).toBe("stratford~2 upon~1 avon~1");
  });

  it("splits on Unicode and non-breaking hyphens too", () => {
    expect(toFuzzyText("saint\u2010denis")).toBe("saint~1 denis~1");
    expect(toFuzzyText("saint\u2011denis")).toBe("saint~1 denis~1");
  });

  it("drops empty words from leading, trailing or repeated separators", () => {
    expect(toFuzzyText("-saint -- denis-")).toBe("saint~1 denis~1");
  });

  it("counts each part's own length for its edits", () => {
    expect(toFuzzyText("kamyanets-podilsky")).toBe("kamyanets~2 podilsky~2");
    expect(toFuzzyText("al-ain")).toBe("al ain");
  });
});

describe("buildSolrQueryParams", () => {
  it("keeps the exact/prefix clause: every name, its prefixes and the reader's label", () => {
    const params = buildSolrQueryParams("rome", "en");
    expect(params.get(P.EXACT_QF)).toBe("names_prefix names^4 label_en^8");
    expect(params.get(P.EXACT_PF)).toBe("names^10");
    expect(params.get(P.EXACT_TEXT)).toBe("rome");
  });

  it("boosts the label in the reader's locale, falling back to the default locale", () => {
    expect(buildSolrQueryParams("київ", "uk").get(P.EXACT_QF)).toContain("label_uk^8");
    expect(buildSolrQueryParams("paris", "xx").get(P.EXACT_QF)).toContain("label_en^8");
  });

  it("makes each word of multi-word input fuzzy on its own", () => {
    const params = buildSolrQueryParams("  saint  petrsburg ", "en");
    expect(params.get(P.EXACT_TEXT)).toBe("saint  petrsburg");
    expect(params.get(P.FUZZY_TEXT)).toBe("saint~1 petrsburg~2");
  });

  it("splits hyphens for the fuzzy clause only; the exact clause keeps the raw text", () => {
    const params = buildSolrQueryParams("sant-denis", "en");
    expect(params.get(P.EXACT_TEXT)).toBe("sant-denis");
    expect(params.get(P.FUZZY_TEXT)).toBe("sant~1 denis~1");
  });

  it("references the reader's text by parameter, never inside the query syntax", () => {
    const params = buildSolrQueryParams('paris" OR *:*', "en");
    expect(params.get("defType")).toBe("lucene");
    expect(params.get("q")).not.toContain("paris");
    expect(params.get(P.EXACT)).toContain(`v=$${P.EXACT_TEXT}`);
    expect(params.get(P.FUZZY)).toContain(`v=$${P.FUZZY_TEXT}`);
    expect(params.has("fq")).toBe(false);
  });

  it("ranks exact matches by a tier, typo matches by closeness and a smaller population boost", () => {
    const rank = buildSolrQueryParams("paris", "en").get(P.RANK);
    expect(rank).toContain(`if(query($${P.EXACT}),sum(${SOLR_RANKING.EXACT_TIER},`);
    expect(rank).toContain(`product(${SOLR_RANKING.EXACT_POPULATION_WEIGHT},`);
    expect(rank).toContain(
      `sum(query($${P.FUZZY}),product(${SOLR_RANKING.FUZZY_POPULATION_WEIGHT},`,
    );
  });

  it("scores a typo on a whole name above a typo on a prefix", () => {
    expect(buildSolrQueryParams("londno", "en").get(P.FUZZY_QF)).toBe(
      `names^${SOLR_SEARCH_WEIGHTS.FUZZY_NAMES} names_prefix`,
    );
  });

  it("sends every ranking rule itself: minimum match and sort", () => {
    const params = buildSolrQueryParams("paris", "en");
    expect(params.get(P.MIN_MATCH)).toBe(SOLR_RANKING.MIN_MATCH);
    expect(params.get(P.EXACT)).toContain(`mm=$${P.MIN_MATCH}`);
    expect(params.get(P.FUZZY)).toContain(`mm=$${P.MIN_MATCH}`);
    expect(params.get("sort")).toBe(SOLR_RANKING.SORT);
  });
});

describe("SOLR_RANKING.EXACT_TIER", () => {
  // * An exact match scores at least the tier; a typo-only match at most its fuzzy score plus
  // * its population boost. Both bounds use the larger population weight, to stay generous.
  it("exceeds the largest population boost plus the largest possible fuzzy score", () => {
    const { MAX_DOCUMENTS, MAX_POPULATION, MAX_QUERY_WORDS, MAX_FUZZY_EXPANSIONS, BM25_K1 } =
      SOLR_SCORE_BOUNDS;
    const maxPopulationBoost =
      Math.max(SOLR_RANKING.EXACT_POPULATION_WEIGHT, SOLR_RANKING.FUZZY_POPULATION_WEIGHT) *
      Math.log10(MAX_POPULATION + 1);
    // * BM25's idf peaks for a term in one document; a term scores at most idf × (k1 + 1)
    const maxIdf = Math.log(1 + (MAX_DOCUMENTS - 1 + 0.5) / (1 + 0.5));
    const maxTermScore = maxIdf * (BM25_K1 + 1);
    const maxFieldWeight = Math.max(SOLR_SEARCH_WEIGHTS.FUZZY_NAMES, 1);
    const maxFuzzyScore = MAX_QUERY_WORDS * MAX_FUZZY_EXPANSIONS * maxFieldWeight * maxTermScore;

    expect(SOLR_RANKING.EXACT_TIER).toBeGreaterThan(maxPopulationBoost + maxFuzzyScore);
  });
});
