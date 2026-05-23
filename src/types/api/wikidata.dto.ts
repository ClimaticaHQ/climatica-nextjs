export type TWikidataSearchItem = {
  id: string;
  concepturi: string;
  label?: string;
  description?: string;
};

export type TWikidataSearchResult = {
  search: TWikidataSearchItem[];
};

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

export type TWikidataSparqlBinding = {
  settlement: { value: string };
  point: { value: string };
  sitelinks: { value: string };
  statements: { value: string };
};

export type TWikidataSparqlResult = {
  results: {
    bindings: TWikidataSparqlBinding[];
  };
};

export type TPopulationBinding = {
  settlement: { value: string };
  population?: { value: string };
};

export type TPopulationResult = {
  results: { bindings: TPopulationBinding[] };
};
