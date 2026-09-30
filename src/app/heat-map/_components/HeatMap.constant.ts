import type { TUrlSchema } from "@/types";
import { SHARED_FILTER_URL_FIELDS } from "@/utils/urlFields.util";
import { selectionUrlField } from "./HeatMap.util";
import type { THeatMapUrlState } from "./HeatMap.type";

export const HEAT_MAP_URL_SCHEMA: TUrlSchema<THeatMapUrlState> = {
  ...SHARED_FILTER_URL_FIELDS,
  selection: selectionUrlField,
};

// * decimals of the heat map's values (legend, popups, export): one; coordinates in popups three
export const HEATMAP_VALUE_DIGITS = 1;
export const HEATMAP_COORDINATE_DIGITS = 3;
