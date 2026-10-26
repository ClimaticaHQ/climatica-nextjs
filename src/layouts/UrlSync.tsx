"use client";

import { useFilterUrlSync } from "@/hooks/filters/useFilterUrlSync";

/**
 * Hosts useFilterUrlSync. It reads the URL (useSearchParams), so it needs a component inside a
 * Suspense boundary, and AppLayout sits above them all. Renders nothing.
 */
export function UrlSync() {
  useFilterUrlSync();
  return null;
}
