export function buildQueryParams(query: string, labelField: string): Record<string, string> {
  const trimmed = query.trim();
  const isSingleWord = !trimmed.includes(" ") && trimmed.length > 2;
  const shared = {
    fl: "geonameid,label_en,label_uk,label_es,latitude,longitude,population,feature_code,country_code",
    sort: "score desc, population desc",
    rows: "10",
    wt: "json",
  };

  if (isSingleWord) {
    return {
      ...shared,
      q: `label_en:${trimmed}~1^3 label_uk:${trimmed}~1^2 label_es:${trimmed}~1`,
      defType: "lucene",
    };
  }

  return {
    ...shared,
    q: trimmed,
    defType: "edismax",
    qf: "label_en^3 label_uk^2 label_es^2",
    pf: `${labelField}^5`,
    mm: "75%",
  };
}
