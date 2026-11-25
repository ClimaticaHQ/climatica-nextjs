import { CLIMATE_PERIODS, DATASETS } from "@/constants";
import type { TClimatePeriod, TDataset } from "@/types";

export function isFullVariableDataAvailable(
  dataset: TDataset | undefined,
  climatePeriod: TClimatePeriod | undefined,
): boolean {
  return dataset === DATASETS.CLIMATE && climatePeriod === CLIMATE_PERIODS.C1970_2000;
}
