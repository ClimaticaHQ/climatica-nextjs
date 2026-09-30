import { DATASETS } from "@/constants";
import type { TCellSize, TClimatePeriod, TMonthFilter, TVariable } from "@/types";

/** One named URL value's write/read pair, composable into a page's TUrlSchema. */
export type TUrlField<TValue> = {
  serialize(value: TValue, params: URLSearchParams): void;
  parse(params: URLSearchParams): TValue | undefined;
};

export type TUrlSchema<TState> = {
  [K in keyof TState]: TUrlField<TState[K]>;
};

export type TDatasetPeriodUrlValue =
  | { dataset: typeof DATASETS.CLIMATE; climatePeriod: TClimatePeriod }
  | { dataset: typeof DATASETS.WEATHER; weatherYear: number };

/** Field key names useUrlStateSync() recognizes as filters-store-bound, not page-specific. */
export type TSharedFilterUrlState = {
  datasetPeriod?: TDatasetPeriodUrlValue;
  variables?: TVariable[];
  gridSize?: TCellSize;
  months?: TMonthFilter;
};

export type TUrlSyncAction = "external" | "ownWrite" | "stateChange";
