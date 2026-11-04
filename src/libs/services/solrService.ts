import "server-only";

import { LOCALES } from "@/constants";
import { env } from "@/libs/Env";
import { logger } from "@/libs/Logger";
import type { TCity, TNearestCityParams, TSolrCityDoc, TSolrResponse } from "@/types";
import { buildNearestPlaceParams, buildSolrQueryParams, getCityDescription } from "@/utils";

const SOLR_BASE_URL = env.SOLR_URL;

/** Throws when Solr is unreachable or answers with an error — an outage is not "no results" */
async function querySolr(params: URLSearchParams): Promise<TSolrCityDoc[]> {
  const response = await fetch(`${SOLR_BASE_URL}/solr/cities/cities?${params}`, {
    next: { revalidate: 0 },
  });
  if (!response.ok) throw new Error(`Solr responded with status ${response.status}`);

  const data: TSolrResponse = await response.json();
  if (data.responseHeader.status !== 0) {
    throw new Error(`Solr error status: ${data.responseHeader.status}`);
  }
  return data.response.docs;
}

function logFailure(operation: string, error: unknown) {
  logger.error(
    `[Solr] ${operation} error: ${error instanceof Error ? error.message : String(error)}`,
  );
}

export const SolrService = {
  /** Throws when Solr is unreachable or answers with an error — an outage is not "no results" */
  async searchCities(query: string, lang: string): Promise<TCity[]> {
    const start = Date.now();
    try {
      const docs = await querySolr(buildSolrQueryParams(query, lang));
      const seen = new Set<string>();
      const mapped = docs
        .filter((doc) => {
          const id = String(doc.geonameid);
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        })
        .map((doc) => SolrService.mapToCity(doc, lang));
      logger.info(`[Solr] searchCities took ${Date.now() - start}ms for query "${query}"`);
      return mapped;
    } catch (error) {
      logFailure("searchCities", error);
      throw error;
    }
  },

  /**
   * The populated place nearest a point, named in `lang` (each index row carries every locale's
   * label); null when none is within the radius. Throws on an outage, like searchCities.
   */
  async findNearestCity({ lat, lng, lang }: TNearestCityParams): Promise<TCity | null> {
    try {
      const [doc] = await querySolr(buildNearestPlaceParams({ lat, lng }));
      return doc ? SolrService.mapToCity(doc, lang) : null;
    } catch (error) {
      logFailure("findNearestCity", error);
      throw error;
    }
  },

  getLabelField(lang: string): string {
    return LOCALES.includes(lang) ? `label_${lang}` : "label_en";
  },

  mapToCity(doc: TSolrCityDoc, lang: string): TCity {
    const labelField = SolrService.getLabelField(lang);
    const label = (doc[labelField as keyof TSolrCityDoc] as string) ?? doc.label_en;

    return {
      id: String(doc.geonameid),
      label,
      description: getCityDescription(doc.feature_code, doc.country_code, lang),
      lat: doc.latitude,
      lng: doc.longitude,
    };
  },
};
