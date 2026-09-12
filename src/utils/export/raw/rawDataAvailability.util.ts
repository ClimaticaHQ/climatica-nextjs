import { CLIMATE_PERIODS, DATASETS } from "@/constants";
import type { TClimatePeriod, TDataset } from "@/types";

/**
 * srad/wind/vapr (everything beyond tmax/tmin/prec) only exist for the climate
 * dataset's c1970-2000 period — see PERIOD_RESTRICTED_VARIABLES in
 * worldclim.constant.ts. The "full data" export has nothing extra to offer
 * outside that combination, so callers must use this SAME check for both
 * whether to render the raw-export menu entries and whether fetchRawData is
 * allowed to run — computing it once and reusing the result, not calling this
 * twice, keeps the two checks from ever drifting apart.
 */
export function isFullVariableDataAvailable(
  dataset: TDataset | undefined,
  climatePeriod: TClimatePeriod | undefined,
): boolean {
  return dataset === DATASETS.CLIMATE && climatePeriod === CLIMATE_PERIODS.C1970_2000;
}
