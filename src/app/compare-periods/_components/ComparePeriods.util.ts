import { DATASETS, MIN_PERIODS, SIDEBAR_PARAMS } from "@/constants";
import type { TUrlField } from "@/types";
import {
  encodePeriods,
  parseDataset,
  parsePeriod,
  parsePeriods,
  parseYear,
} from "@/utils/urlParams.util";
import type { TComparePeriodsValue } from "./ComparePeriods.type";

/** Legacy links may still carry yearA/yearB instead of a comma-joined periods list. */
export const comparePeriodsUrlField: TUrlField<TComparePeriodsValue> = {
  serialize(value, params) {
    params.set(SIDEBAR_PARAMS.DATASET, value.dataset);
    if (value.dataset === DATASETS.CLIMATE) {
      params.set(SIDEBAR_PARAMS.PERIOD_A, value.climatePeriodA);
      params.set(SIDEBAR_PARAMS.PERIOD_B, value.climatePeriodB);
    } else {
      params.set(SIDEBAR_PARAMS.PERIODS, encodePeriods(value.weatherPeriods));
    }
  },
  parse(params) {
    const dataset = parseDataset(params.get(SIDEBAR_PARAMS.DATASET));
    if (dataset === null) return undefined;

    if (dataset === DATASETS.CLIMATE) {
      const climatePeriodA = parsePeriod(params.get(SIDEBAR_PARAMS.PERIOD_A));
      const climatePeriodB = parsePeriod(params.get(SIDEBAR_PARAMS.PERIOD_B));
      return climatePeriodA !== null && climatePeriodB !== null
        ? { dataset, climatePeriodA, climatePeriodB }
        : undefined;
    }

    const fromPeriods = parsePeriods(params.get(SIDEBAR_PARAMS.PERIODS));
    if (fromPeriods !== null && fromPeriods.length >= MIN_PERIODS) {
      return { dataset, weatherPeriods: fromPeriods };
    }

    const yearA = parseYear(params.get(SIDEBAR_PARAMS.YEAR_A));
    const yearB = parseYear(params.get(SIDEBAR_PARAMS.YEAR_B));
    return yearA !== null && yearB !== null
      ? { dataset, weatherPeriods: [yearA, yearB] }
      : undefined;
  },
};
