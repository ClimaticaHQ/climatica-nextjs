import type { TLocale } from "@/types";

export type TSolrCityDoc = {
  geonameid: number;
  label_en: string;
  latitude: number;
  longitude: number;
  population: number;
  feature_code: string;
  country_code: string;
} & Partial<Record<`label_${TLocale}`, string>>;

export type TSolrResponse = {
  responseHeader: { status: number; QTime: number };
  response: {
    numFound: number;
    docs: TSolrCityDoc[];
  };
};
