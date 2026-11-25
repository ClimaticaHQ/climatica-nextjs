import type { DATASET_SELECTION_SHARED_SCOPE } from "@/constants";
import type { TDataset } from "../domain";
import type { TFilters } from "../filters";
import type { TPageRoute } from "./lastPageParamsStore.type";

export type TDatasetSelections = Partial<Record<TDataset, TFilters>>;

export type TDatasetSelectionScope = TPageRoute | typeof DATASET_SELECTION_SHARED_SCOPE;

export type TDatasetSelectionState = {
  selections: Partial<Record<TDatasetSelectionScope, TDatasetSelections>>;
  remember: (scope: TDatasetSelectionScope, filters: TFilters) => void;
};

export type TDatasetSelectionScopeArgs = {
  pathname: string;
  isSyncingFilters: boolean;
};
