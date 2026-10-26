import { FILTER_LIST_SEPARATOR, FILTER_WEATHER_PERIODS_LIMITS, FILTERS_CONFIG } from "@/constants";
import { EFilterKey } from "@/enums";
import type { TFilterCodecs } from "@/types";
import {
  encodeMonths,
  parseCellSize,
  parseDataset,
  parseMonths,
  parsePeriod,
  parsePeriods,
  parseVars,
  parseYear,
} from "./urlParams.util";

function paramOf(key: EFilterKey, params: URLSearchParams) {
  return params.get(FILTERS_CONFIG[key].param);
}

function joinList(values: readonly (string | number)[]) {
  return values.join(FILTER_LIST_SEPARATOR);
}

/** Legacy links carried exactly two weather years, as year1 / year2. */
function parseLegacyWeatherPeriods(params: URLSearchParams) {
  const years = (FILTERS_CONFIG[EFilterKey.WEATHER_PERIODS].legacyParams ?? []).map((param) =>
    parseYear(params.get(param)),
  );
  const valid = years.filter((year) => year !== null);
  return valid.length === years.length && valid.length > 0 ? valid : null;
}

/** Each filter's URL read/write pair: parse returns null for an absent or invalid value. */
export const FILTER_CODECS: TFilterCodecs = {
  [EFilterKey.DATASET]: {
    parse: (params) => parseDataset(paramOf(EFilterKey.DATASET, params)),
    encode: (value) => value,
  },
  [EFilterKey.CLIMATE_PERIOD]: {
    parse: (params) => parsePeriod(paramOf(EFilterKey.CLIMATE_PERIOD, params)),
    encode: (value) => value,
  },
  [EFilterKey.WEATHER_YEAR]: {
    parse: (params) => parseYear(paramOf(EFilterKey.WEATHER_YEAR, params)),
    encode: (value) => String(value),
  },
  [EFilterKey.VARIABLES]: {
    parse: (params) => parseVars(paramOf(EFilterKey.VARIABLES, params)),
    encode: joinList,
  },
  [EFilterKey.GRID_SIZE]: {
    parse: (params) => parseCellSize(paramOf(EFilterKey.GRID_SIZE, params)),
    encode: (value) => value,
  },
  [EFilterKey.MONTHS]: {
    parse: (params) => parseMonths(paramOf(EFilterKey.MONTHS, params)),
    encode: encodeMonths,
  },
  [EFilterKey.CLIMATE_PERIOD_A]: {
    parse: (params) => parsePeriod(paramOf(EFilterKey.CLIMATE_PERIOD_A, params)),
    encode: (value) => value,
  },
  [EFilterKey.CLIMATE_PERIOD_B]: {
    parse: (params) => parsePeriod(paramOf(EFilterKey.CLIMATE_PERIOD_B, params)),
    encode: (value) => value,
  },
  [EFilterKey.WEATHER_PERIODS]: {
    parse: (params) => {
      const periods = parsePeriods(paramOf(EFilterKey.WEATHER_PERIODS, params));
      return periods !== null && periods.length >= FILTER_WEATHER_PERIODS_LIMITS.MIN
        ? periods
        : parseLegacyWeatherPeriods(params);
    },
    encode: joinList,
  },
};
