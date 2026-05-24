export type TSolrCityDoc = {
  geonameid: string;
  label_en: string;
  label_uk?: string;
  label_es?: string;
  latitude: number;
  longitude: number;
  population: number;
  feature_code: string;
  country_code: string;
};

export type TSolrResponse = {
  responseHeader: { status: number; QTime: number };
  response: {
    numFound: number;
    docs: TSolrCityDoc[];
  };
};
