"use client";

import { useLegacyStorageCleanup } from "../persisted/useLegacyStorageCleanup";
import { useLastPageParamsSync } from "../url/useLastPageParamsSync";
import { useCanonicalFilterUrl } from "./useCanonicalFilterUrl";

export function useFilterUrlSync() {
  useCanonicalFilterUrl();
  useLastPageParamsSync();
  useLegacyStorageCleanup();
}
