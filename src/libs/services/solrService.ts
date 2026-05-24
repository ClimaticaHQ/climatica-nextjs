import { SOLR_CONFIG } from "@/constants";
import { logger } from "@/libs/Logger";
import type { TSolrCityDoc, TSolrResponse, TWikidataCity } from "@/types";

export const SolrService = {
  async searchCities(query: string, lang: string): Promise<TWikidataCity[]> {
    const labelField = SolrService.getLabelField(lang);

    const params = new URLSearchParams({
      q: query,
      defType: "edismax",
      qf: "label_en^3 label_uk^2 label_es^2",
      pf: `${labelField}^5`,
      fl: "geonameid,label_en,label_uk,label_es,latitude,longitude,population,feature_code,country_code",
      sort: "score desc, population desc",
      rows: "10",
      wt: "json",
    });

    const url = `${SOLR_CONFIG.BASE_URL}/solr/cities/select?${params}`;

    try {
      const response = await fetch(url, {
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`Solr responded with status ${response.status}`);
      }

      const data: TSolrResponse = await response.json();

      if (data.responseHeader.status !== 0) {
        throw new Error(`Solr error status: ${data.responseHeader.status}`);
      }

      return data.response.docs.map((doc) => SolrService.mapToCity(doc, lang));
    } catch (error: any) {
      logger.error(`[Solr] searchCities error: ${error.message}`);
      return [];
    }
  },

  getLabelField(lang: string): string {
    const map: Record<string, string> = {
      uk: "label_uk",
      es: "label_es",
      en: "label_en",
    };
    return map[lang] ?? "label_en";
  },

  mapToCity(doc: TSolrCityDoc, lang: string): TWikidataCity {
    const labelField = SolrService.getLabelField(lang);
    const label = (doc[labelField as keyof TSolrCityDoc] as string) ?? doc.label_en;

    return {
      id: doc.geonameid,
      label,
      description: `${doc.feature_code} · ${doc.country_code}`,
      lat: doc.latitude,
      lng: doc.longitude,
    };
  },
};
