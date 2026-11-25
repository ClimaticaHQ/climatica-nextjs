import { DATASET_SELECTION_SHARED_SCOPE } from "@/constants";
import type { TDatasetSelectionScope, TDatasetSelectionScopeArgs } from "@/types";
import { toPageRoute } from "./lastPageParams.util";

export function getDatasetSelectionScope({
  pathname,
  isSyncingFilters,
}: TDatasetSelectionScopeArgs): TDatasetSelectionScope {
  const route = toPageRoute(pathname);
  return isSyncingFilters || route === null ? DATASET_SELECTION_SHARED_SCOPE : route;
}
