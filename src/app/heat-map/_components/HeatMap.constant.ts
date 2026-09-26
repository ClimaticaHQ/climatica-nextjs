import type { TUrlSchema } from "@/types";
import { SHARED_FILTER_URL_FIELDS } from "@/utils/urlFields.util";
import { selectionUrlField } from "./HeatMap.util";
import type { THeatMapUrlState } from "./HeatMap.type";

export const HEAT_MAP_URL_SCHEMA: TUrlSchema<THeatMapUrlState> = {
  ...SHARED_FILTER_URL_FIELDS,
  selection: selectionUrlField,
};
