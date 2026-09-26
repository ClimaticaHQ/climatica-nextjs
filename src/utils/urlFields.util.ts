import { DATASETS, SIDEBAR_PARAMS } from "@/constants";
import type {
  TCellSize,
  TCity,
  TDatasetPeriodUrlValue,
  TMonthFilter,
  TUrlField,
  TVariable,
} from "@/types";
import {
  encodeMonths,
  encodeVars,
  parseCellSize,
  parseCoord,
  parseDataset,
  parseMonths,
  parsePeriod,
  parseVars,
  parseYear,
} from "./urlParams.util";

/** Same factory for every city — only the param names differ per page/slot. */
export function cityUrlField(paramNames: {
  name: string;
  lat: string;
  lng: string;
}): TUrlField<TCity> {
  return {
    serialize(value, params) {
      params.set(paramNames.name, value.label.trim());
      params.set(paramNames.lat, value.lat.toFixed(4));
      params.set(paramNames.lng, value.lng.toFixed(4));
    },
    parse(params) {
      const lat = parseCoord(params.get(paramNames.lat));
      const lng = parseCoord(params.get(paramNames.lng));
      if (lat === null || lng === null) return undefined;
      const label = params.get(paramNames.name) ?? `${lat}, ${lng}`;
      return { id: `url:${lat},${lng}`, label, description: "", lat, lng };
    },
  };
}

/** Period/year are mutually exclusive by dataset, so they travel as one field. */
export const datasetPeriodUrlField: TUrlField<TDatasetPeriodUrlValue> = {
  serialize(value, params) {
    params.set(SIDEBAR_PARAMS.DATASET, value.dataset);
    if (value.dataset === DATASETS.CLIMATE) {
      params.set(SIDEBAR_PARAMS.PERIOD, value.climatePeriod);
    } else {
      params.set(SIDEBAR_PARAMS.YEAR, String(value.weatherYear));
    }
  },
  parse(params) {
    const dataset = parseDataset(params.get(SIDEBAR_PARAMS.DATASET));
    if (dataset === null) return undefined;

    if (dataset === DATASETS.CLIMATE) {
      const climatePeriod = parsePeriod(params.get(SIDEBAR_PARAMS.PERIOD));
      return climatePeriod !== null ? { dataset, climatePeriod } : undefined;
    }

    const weatherYear = parseYear(params.get(SIDEBAR_PARAMS.YEAR));
    return weatherYear !== null ? { dataset, weatherYear } : undefined;
  },
};

export const variablesUrlField: TUrlField<TVariable[]> = {
  serialize(value, params) {
    params.set(SIDEBAR_PARAMS.VAR, encodeVars(value));
  },
  parse(params) {
    return parseVars(params.get(SIDEBAR_PARAMS.VAR)) ?? undefined;
  },
};

export const gridSizeUrlField: TUrlField<TCellSize> = {
  serialize(value, params) {
    params.set(SIDEBAR_PARAMS.GRID, value);
  },
  parse(params) {
    return parseCellSize(params.get(SIDEBAR_PARAMS.GRID)) ?? undefined;
  },
};

/** An empty or full-12 selection is unreachable through the UI — canonicalized here anyway. */
export const monthsUrlField: TUrlField<TMonthFilter> = {
  serialize(value, params) {
    const canonical =
      value !== "all" && (value.length === 0 || value.length === 12) ? "all" : value;
    params.set(SIDEBAR_PARAMS.MONTHS, encodeMonths(canonical));
  },
  parse(params) {
    return parseMonths(params.get(SIDEBAR_PARAMS.MONTHS)) ?? undefined;
  },
};

/** Key names matter here — useUrlStateSync() recognizes them by name. */
export const SHARED_FILTER_URL_FIELDS = {
  datasetPeriod: datasetPeriodUrlField,
  variables: variablesUrlField,
  gridSize: gridSizeUrlField,
};
