export type TWikidataGeoSearchItem = {
  title: string;
  lat: number;
  lon: number;
};

export type TWikidataGeoSearchResult = {
  query?: {
    geosearch?: TWikidataGeoSearchItem[];
  };
};

export type TWikidataEntityValue = {
  value: string;
};

export type TWikidataLabelMap = Record<string, TWikidataEntityValue>;

export type TWikidataCoords = {
  latitude: number;
  longitude: number;
};

export type TWikidataEntity = {
  labels?: TWikidataLabelMap;
  descriptions?: TWikidataLabelMap;
  claims?: {
    P625?: { mainsnak?: { datavalue?: { value?: TWikidataCoords } } }[];
  };
};

export type TWikidataEntitiesResult = {
  entities: Record<string, TWikidataEntity>;
};
