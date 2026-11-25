import type { TClimatePeriod } from "@/constants/worldclim.constant";

export type TSparqlValue = {
  type: string;
  value: string;
};

export type TSparqlUriValue = {
  type: "uri";
  value: string;
};

export interface TWorldClimCellResponse {
  results: {
    bindings: {
      cell: TSparqlUriValue;
      grid: TSparqlUriValue;
    }[];
  };
}

export interface TWorldClimPixelResource {
  iri: string;
  cell: string;
  raster: string;
  variable: string;
  valueMonth01: number;
  valueMonth02: number;
  valueMonth03: number;
  valueMonth04: number;
  valueMonth05: number;
  valueMonth06: number;
  valueMonth07: number;
  valueMonth08: number;
  valueMonth09: number;
  valueMonth10: number;
  valueMonth11: number;
  valueMonth12: number;
}

/** SCRAPI returns one row per pixel × month, not one per pixel */
export type TRawPixelValueBinding = {
  value: TSparqlValue;
  month: TSparqlValue;
  pixel: TSparqlUriValue;
  raster?: TSparqlUriValue;
  var?: TSparqlUriValue;
  cell?: TSparqlUriValue;
  grid?: TSparqlUriValue;
};

export type TRawPixelValueResponse = {
  results: { bindings: TRawPixelValueBinding[] };
};

/** SCRAPI returns one row per raster × month */
export type TRawAvgValueBinding = {
  avgval: TSparqlValue;
  month: TSparqlValue;
  ncells?: TSparqlValue;
  raster?: TSparqlUriValue;
  var?: TSparqlUriValue;
  grid?: TSparqlUriValue;
};

export type TRawAvgValueResponse = {
  results: { bindings: TRawAvgValueBinding[] };
};

export type TWorldClimBoxBinding = {
  pixel: TSparqlUriValue;
  cell?: TSparqlUriValue;
  lat?: TSparqlValue;
  lng?: TSparqlValue;
  variable?: TSparqlUriValue;
  valueMonth01: TSparqlValue;
  valueMonth02: TSparqlValue;
  valueMonth03: TSparqlValue;
  valueMonth04: TSparqlValue;
  valueMonth05: TSparqlValue;
  valueMonth06: TSparqlValue;
  valueMonth07: TSparqlValue;
  valueMonth08: TSparqlValue;
  valueMonth09: TSparqlValue;
  valueMonth10: TSparqlValue;
  valueMonth11: TSparqlValue;
  valueMonth12: TSparqlValue;
};

export type TWorldClimBoxResponse = {
  results: {
    bindings: TWorldClimBoxBinding[];
  };
};

export type TWorldClimAvgBoxBinding = {
  raster?: TSparqlUriValue;
  variable?: TSparqlUriValue;
  valueMonth01?: TSparqlValue;
  valueMonth02?: TSparqlValue;
  valueMonth03?: TSparqlValue;
  valueMonth04?: TSparqlValue;
  valueMonth05?: TSparqlValue;
  valueMonth06?: TSparqlValue;
  valueMonth07?: TSparqlValue;
  valueMonth08?: TSparqlValue;
  valueMonth09?: TSparqlValue;
  valueMonth10?: TSparqlValue;
  valueMonth11?: TSparqlValue;
  valueMonth12?: TSparqlValue;
};

export type TWorldClimPointValueBinding = {
  value: TSparqlValue;
  month: TSparqlValue;
  pixel: TSparqlUriValue;
  raster: TSparqlUriValue;
  var: TSparqlUriValue;
  cell: TSparqlUriValue;
  grid: TSparqlUriValue;
};

export type TWorldClimPointValueResponse = {
  results: {
    bindings: TWorldClimPointValueBinding[];
  };
};

export type TWorldClimCellResource = {
  iri: string;
  elevation?: number;
};

export type TWorldClimRasterResource = {
  iri: string;
  isClimate?: boolean;
  isWeather?: boolean;
  creator: { nolang: string };
  version: number;
  start: string | number;
  end: string | number;
  temporalResolution: string;
  grid: string;
  variable: string;
};

export type { TClimatePeriod };
