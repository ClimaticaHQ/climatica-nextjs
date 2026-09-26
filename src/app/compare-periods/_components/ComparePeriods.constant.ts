import { SIDEBAR_PARAMS } from "@/constants";
import type { TUrlSchema } from "@/types";
import {
  cityUrlField,
  gridSizeUrlField,
  monthsUrlField,
  variablesUrlField,
} from "@/utils/urlFields.util";
import { comparePeriodsUrlField } from "./ComparePeriods.util";
import type { TComparePeriodsUrlState } from "./ComparePeriods.type";

export const COMPARE_PERIODS_URL_SCHEMA: TUrlSchema<TComparePeriodsUrlState> = {
  city: cityUrlField({
    name: SIDEBAR_PARAMS.CITY,
    lat: SIDEBAR_PARAMS.LAT,
    lng: SIDEBAR_PARAMS.LNG,
  }),
  comparePeriods: comparePeriodsUrlField,
  variables: variablesUrlField,
  gridSize: gridSizeUrlField,
  months: monthsUrlField,
};
