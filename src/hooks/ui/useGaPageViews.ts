"use client";

import { gaPageViewTracker } from "@/stores/gaPageViewTracker";
import { getGaPageTitle, getPageUrl, sendPageView } from "@/utils/analyticsConsent.util";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function useGaPageViews() {
  const pathname = usePathname();

  // * keyed on the pathname only: query-only changes (filters, chart mode, places) are not page views
  useEffect(() => {
    const location = getPageUrl(`${window.location.origin}${pathname}`);
    const visit = gaPageViewTracker.visit(location);
    if (!visit.isNew) return;
    const referrer = visit.previous ?? getPageUrl(document.referrer);
    sendPageView({ location, referrer, title: getGaPageTitle(pathname) });
  }, [pathname]);
}
