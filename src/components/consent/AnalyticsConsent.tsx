"use client";

import { useAnalyticsConsent } from "@/hooks/persisted/useAnalyticsConsent";
import { useGaAppLanguage } from "@/hooks/ui/useGaAppLanguage";
import { useGaPageViews } from "@/hooks/ui/useGaPageViews";
import { disableAnalytics, enableAnalytics } from "@/utils/analyticsConsent.util";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useLayoutEffect } from "react";
import { ConsentBanner } from "./ConsentBanner";
import type { TGoogleAnalyticsScriptsProps } from "./consent.type";

/**
 * Google Analytics, only once accepted: before that no script is rendered and nothing is
 * requested from Google. Rejecting or withdrawing stops a loaded gtag and removes its cookies.
 * Mounted once in AppLayout; renders nothing without a measurement ID.
 */
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

/**
 * GA's scripts, with its defaults queued first (a layout effect runs before next/script's), then
 * the page views, after GA's config (a later sibling's effect runs after the script's).
 */
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
