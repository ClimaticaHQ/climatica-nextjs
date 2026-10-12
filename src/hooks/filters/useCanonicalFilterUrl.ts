"use client";

import { usePathname, useRouter } from "next/navigation";
import { useNavigationIntentStore } from "@/stores";
import { getCanonicalFilterUrlParams } from "@/utils/filtersUrl.util";
import { replaceUrlParams } from "@/utils/navigation.util";
import { canWriteUrlState } from "@/utils/urlStateGuard.util";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useFilterView } from "./useFilterView";

/**
 * Keeps the address matching what's rendered: when the URL's filter params aren't canonical
 * (a default written out, an invalid or legacy value, one normalization changed), replaces it
 * once with the canonical params. Canonical params are a fixed point, so this can't loop; the
 * write is guarded like useUrlStateSync's, so it never cancels a navigation or a restored entry.
 */
export function useCanonicalFilterUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const view = useFilterView();
  const search = useSearchParams().toString();

  useEffect(() => {
    if (view === null) return;
    const canonical = getCanonicalFilterUrlParams(new URLSearchParams(search));
    if (canonical === null) return;

    const timer = window.setTimeout(() => {
      const canWrite = canWriteUrlState({
        currentPathname: window.location.pathname,
        pagePathname: pathname,
        pendingPathname: useNavigationIntentStore.getState().pendingPathname,
        currentSearch: new URLSearchParams(window.location.search).toString(),
        scheduledSearch: search,
      });
      if (canWrite) replaceUrlParams(router, pathname, canonical);
    });
    return () => window.clearTimeout(timer);
  }, [view, search, pathname, router]);
}
