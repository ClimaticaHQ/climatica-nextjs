"use client";

import { useFilterUrlSync } from "@/hooks/filters/useFilterUrlSync";

/** useSearchParams needs a Suspense boundary, and AppLayout sits above them all */
export function UrlSync() {
  useFilterUrlSync();
  return null;
}
