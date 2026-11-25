"use client";

import { useAnalyticsConsent } from "@/hooks/persisted/useAnalyticsConsent";
import { useGaAppLanguage } from "@/hooks/ui/useGaAppLanguage";
import { useGaPageViews } from "@/hooks/ui/useGaPageViews";
import { disableAnalytics, enableAnalytics } from "@/utils/analyticsConsent.util";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useLayoutEffect } from "react";
import { ConsentBanner } from "./ConsentBanner";
import type { TGoogleAnalyticsScriptsProps } from "./consent.type";

export function AnalyticsConsent() {
  const consent = useAnalyticsConsent();
  const { isAvailable, isGranted, gaId } = consent;

  useEffect(() => {
    if (isAvailable && !isGranted) disableAnalytics(gaId);
  }, [isAvailable, isGranted, gaId]);

  if (!isAvailable) return null;

  return (
    <>
      {isGranted && <GoogleAnalyticsScripts gaId={gaId} />}
      {consent.isBannerShown && (
        <ConsentBanner onAccept={consent.accept} onReject={consent.reject} />
      )}
    </>
  );
}

/** a layout effect queues GA's defaults before next/script's; the page views come after GA's config */
function GoogleAnalyticsScripts({ gaId }: TGoogleAnalyticsScriptsProps) {
  useLayoutEffect(() => enableAnalytics(gaId), [gaId]);
  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      <PageViews />
    </>
  );
}

/** The app language first (effects run in order): the first page view already carries it. */
function PageViews() {
  useGaAppLanguage();
  useGaPageViews();
  return null;
}
