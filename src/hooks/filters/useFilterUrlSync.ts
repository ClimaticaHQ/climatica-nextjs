"use client";

import { useLegacyStorageCleanup } from "../persisted/useLegacyStorageCleanup";
import { useLastPageParamsSync } from "../url/useLastPageParamsSync";
import { useCanonicalFilterUrl } from "./useCanonicalFilterUrl";

/**
 * App-wide URL upkeep: keeps the filter params canonical, remembers each page's own params
 * for the navbar links, and clears what older versions kept in localStorage.
 */
export function useFilterUrlSync() {
  useCanonicalFilterUrl();
  useLastPageParamsSync();
  useLegacyStorageCleanup();
}
