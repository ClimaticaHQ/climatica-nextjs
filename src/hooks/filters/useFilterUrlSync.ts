"use client";

import { useLastPageParamsSync } from "../url/useLastPageParamsSync";
import { useCanonicalFilterUrl } from "./useCanonicalFilterUrl";
import { useLegacyFilterStorageCleanup } from "./useLegacyFilterStorageCleanup";

/**
 * App-wide URL upkeep: keeps the filter params canonical, remembers each page's own params
 * for the navbar links, and clears the filters older versions kept in localStorage.
 */
export function useFilterUrlSync() {
  useCanonicalFilterUrl();
  useLastPageParamsSync();
  useLegacyFilterStorageCleanup();
}
