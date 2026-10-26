import { DATASET_SELECTION_SHARED_SCOPE } from "@/constants";
import type { TDatasetSelectionScope, TDatasetSelectionScopeArgs } from "@/types";
import { toPageRoute } from "./lastPageParams.util";

/** Every page's selections while filters are synced; otherwise this page's (if it's one). */
export function getDatasetSelectionScope({
  pathname,
  isSyncingFilters,
}: TDatasetSelectionScopeArgs): TDatasetSelectionScope {
  const route = toPageRoute(pathname);
  return isSyncingFilters || route === null ? DATASET_SELECTION_SHARED_SCOPE : route;
}
