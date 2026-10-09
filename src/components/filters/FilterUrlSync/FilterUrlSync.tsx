"use client";

import {
  useCanonicalFilterUrl,
  useLastPageParamsSync,
  useLegacyFilterStorageCleanup,
} from "@/hooks";

/**
 * Keeps the filter URL canonical, remembers each page's own params for the navbar links, and
 * clears the old localStorage filters. Renders nothing.
 */
export function FilterUrlSync() {
  useCanonicalFilterUrl();
  useLastPageParamsSync();
  useLegacyFilterStorageCleanup();
  return null;
}
