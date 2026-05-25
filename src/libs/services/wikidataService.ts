import "server-only";

import { ENDPOINTS, EXCLUDE_DESCRIPTION_KEYWORDS } from "@/constants";
import type {
  TPopulationResult,
  TWikidataCity,
  TWikidataEntitiesResult,
  TWikidataGeoSearchResult,
  TWikidataSearchResult,
  TWikidataSparqlResult,
} from "@/types";
import { isValidString, parseWktPoint } from "@/utils";
import axios from "axios";
import i18n from "i18next";

const searchCache = new Map<string, TWikidataCity[]>();
const CACHE_MAX_SIZE = 100;

const POP_TIERS = [
  { threshold: 5_000_000, score: 1_000_000 },
  { threshold: 1_000_000, score: 100_000 },
  { threshold: 500_000, score: 50_000 },
  { threshold: 100_000, score: 10_000 },
  { threshold: 50_000, score: 5_000 },
  { threshold: 10_000, score: 1_000 },
  { threshold: 1_000, score: 100 },
] as const;

function popTier(pop: number): number {
  return POP_TIERS.find(({ threshold }) => pop >= threshold)?.score ?? 0;
}

function storeCache(key: string, cities: TWikidataCity[]): void {
  if (searchCache.size >= CACHE_MAX_SIZE) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey !== undefined) searchCache.delete(firstKey);
  }
  searchCache.set(key, cities);
}

export const WikidataService = {
  async searchCity(query: string): Promise<TWikidataCity[]> {
    const rawLang = i18n.language ?? "en";
    const lang = rawLang === "ua" ? "uk" : rawLang;
    const cacheKey = `${query}::${lang}`;

    const cached = searchCache.get(cacheKey);
    if (cached) return cached;

    const searchRes = await axios.get<TWikidataSearchResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbsearchentities",
        search: query,
        language: lang,
        uselang: lang,
        type: "item",
        limit: 100,
        format: "json",
        origin: "*",
      },
    });

    const items = searchRes.data.search;
    if (items.length === 0) return [];

    const ids = items.map((item) => item.id);
    const values = ids.map((id) => `wd:${id}`).join(" ");

    const sparqlQuery = `
      SELECT DISTINCT ?settlement ?point ?sitelinks ?statements WHERE {
        VALUES ?settlement { ${values} }
        {
          { ?settlement wdt:P31/wdt:P279* wd:Q15284 }
          UNION
          { ?settlement wdt:P31/wdt:P279* wd:Q486972 }
          UNION
          { ?settlement wdt:P31/wdt:P279* wd:Q23442 }
          UNION
          { ?settlement wdt:P31/wdt:P279* wd:Q183039 }
          UNION
          { ?settlement wdt:P31/wdt:P279* wd:Q10864048 }
          UNION
          { ?settlement wdt:P31/wdt:P279* wd:Q515 }
        }
        ?settlement wdt:P625 ?point .
        ?settlement wikibase:sitelinks ?sitelinks .
        ?settlement wikibase:statements ?statements .
      }
    `;

    const popQuery = `
      SELECT ?settlement (MAX(?populationRaw) AS ?population) WHERE {
        VALUES ?settlement { ${values} }
        OPTIONAL { ?settlement wdt:P1082 ?populationRaw . }
      }
      GROUP BY ?settlement
    `;

    const coordReq = axios.get<TWikidataSparqlResult>(ENDPOINTS.WIKIDATA_SPARQL as string, {
      params: { query: sparqlQuery, format: "json" },
      headers: { Accept: "application/sparql-results+json" },
    });

    const popReq = axios
      .get<TPopulationResult>(ENDPOINTS.WIKIDATA_SPARQL, {
        params: { query: popQuery, format: "json" },
        headers: { Accept: "application/sparql-results+json" },
      })
      .then((r) => r.data)
      .catch(() => null);

    const popTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

    const [sparqlRes, popData] = await Promise.all([coordReq, Promise.race([popReq, popTimeout])]);

    const bindings = sparqlRes.data.results.bindings;
    if (bindings.length === 0) return [];

    const itemMap = new Map(items.map((item) => [item.id, item]));
    const lowerQuery = query.toLowerCase();

    const coordExtras = new Map<string, { sitelinks: number; statements: number }>();
    for (const cb of bindings) {
      const id = cb.settlement.value.split("/").pop() ?? "";
      coordExtras.set(id, {
        sitelinks: Number(cb.sitelinks.value),
        statements: Number(cb.statements.value),
      });
    }

    const sortedBindings = [...bindings].sort((ba, bb) => {
      const idA = ba.settlement.value.split("/").pop() ?? "";
      const idB = bb.settlement.value.split("/").pop() ?? "";
      const exactA = (itemMap.get(idA)?.label ?? "").toLowerCase() === lowerQuery ? 10000 : 0;
      const exactB = (itemMap.get(idB)?.label ?? "").toLowerCase() === lowerQuery ? 10000 : 0;
      const scoreA = 3 * Number(ba.sitelinks.value) + Number(ba.statements.value) + exactA;
      const scoreB = 3 * Number(bb.sitelinks.value) + Number(bb.statements.value) + exactB;
      return scoreB - scoreA;
    });

    const seen = new Set<string>();
    const candidates: TWikidataCity[] = [];

    for (const binding of sortedBindings) {
      if (!isValidString(binding.settlement.value)) continue;

      const id = binding.settlement.value.split("/").pop() ?? binding.settlement.value;
      if (seen.has(id)) continue;
      seen.add(id);

      if (!isValidString(binding.point.value)) continue;

      const coords = parseWktPoint(binding.point.value);
      if (!coords) continue;

      const searchItem = itemMap.get(id);
      const description = String(searchItem?.description ?? "");
      const lowerDesc = description.toLowerCase();

      if (EXCLUDE_DESCRIPTION_KEYWORDS.some((k) => lowerDesc.includes(k))) continue;

      candidates.push({
        id,
        label: String(searchItem?.label ?? id),
        description,
        lat: coords.lat,
        lng: coords.lng,
      });
    }

    if (candidates.length === 0) return [];

    if (!popData) {
      const stage1 = candidates.slice(0, 10);
      storeCache(cacheKey, stage1);
      return stage1;
    }

    const popMap = new Map<string, number>();
    for (const b of popData.results.bindings) {
      const id = b.settlement.value.split("/").pop() ?? "";
      if (b.population !== undefined) {
        const pop = Number(b.population.value);
        const existing = popMap.get(id);
        if (existing === undefined || pop > existing) popMap.set(id, pop);
      }
    }

    const stage2 = [...candidates]
      .sort((a, b) => {
        const exactA = a.label.toLowerCase() === lowerQuery ? 10000 : 0;
        const exactB = b.label.toLowerCase() === lowerQuery ? 10000 : 0;
        const extA = coordExtras.get(a.id);
        const extB = coordExtras.get(b.id);
        const scoreA =
          3 * (extA?.sitelinks ?? 0) +
          (extA?.statements ?? 0) +
          exactA +
          popTier(popMap.get(a.id) ?? 0);
        const scoreB =
          3 * (extB?.sitelinks ?? 0) +
          (extB?.statements ?? 0) +
          exactB +
          popTier(popMap.get(b.id) ?? 0);
        return scoreB - scoreA;
      })
      .slice(0, 10);

    storeCache(cacheKey, stage2);
    return stage2;
  },

  async findNearestCityByCoordinates(lat: number, lng: number): Promise<TWikidataCity | null> {
    const lang = i18n.language ?? "en";

    const geoSearchRes = await axios.get<TWikidataGeoSearchResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "query",
        list: "geosearch",
        gscoord: `${lat}|${lng}`,
        gsradius: 10000,
        gslimit: 5,
        format: "json",
        origin: "*",
      },
    });

    const geosearch = geoSearchRes.data.query?.geosearch;
    if (!Array.isArray(geosearch) || geosearch.length === 0) {
      return null;
    }

    const geoItems = geosearch.filter(
      (item) => item && typeof item.title === "string" && /^Q\d+$/.test(item.title),
    );

    if (geoItems.length === 0) return null;

    const ids = geoItems.map((item) => item.title).join("|");

    const entitiesRes = await axios.get<TWikidataEntitiesResult>(ENDPOINTS.WIKIDATA, {
      params: {
        action: "wbgetentities",
        ids,
        props: "labels|descriptions",
        languages: `${lang}|en`,
        format: "json",
        origin: "*",
      },
    });

    const entities = entitiesRes.data.entities;

    for (const geoItem of geoItems) {
      const id = geoItem.title;
      const entity = entities[id];
      if (!entity) continue;

      const label = entity.labels?.[lang]?.value ?? entity.labels?.["en"]?.value ?? "";
      const description =
        entity.descriptions?.[lang]?.value ?? entity.descriptions?.["en"]?.value ?? "";

      return {
        id,
        label: label || id,
        description,
        lat: geoItem.lat,
        lng: geoItem.lon,
      };
    }

    return null;
  },
};
