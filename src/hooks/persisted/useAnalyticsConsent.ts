"use client";

import { EAnalyticsConsent } from "@/enums";
import { GLOBAL_CONFIG } from "@/libs/GlobalConfig";
import { analyticsConsentStore } from "@/stores/analyticsConsentStore";
import { useConsentBannerStore } from "@/stores/consentBannerStore";
import { createConsentRecord } from "@/utils/analyticsConsent.util";
import { useIsClient } from "@/hooks/ui/useIsClient";
import { usePersistedJson } from "./usePersistedJson";

/**
 * The analytics choice and the ways to change it. Without a measurement ID nothing is
 * available: no banner, no Settings row, no Cookie settings.
 */
export function useAnalyticsConsent() {
  const [stored, setStored] = usePersistedJson(analyticsConsentStore);
  const { isReopened, reopen, close } = useConsentBannerStore();
  // * the server and hydration see no stored choice: nothing is shown before the client reads it
  const isClient = useIsClient();
  const isAvailable = GLOBAL_CONFIG.analyticsId !== "" && isClient;

  const choose = (choice: EAnalyticsConsent) => {
    setStored(createConsentRecord(choice, Date.now()));
    close();
  };

  return {
    isAvailable,
    gaId: GLOBAL_CONFIG.analyticsId,
    isGranted: isAvailable && stored?.choice === EAnalyticsConsent.GRANTED,
    // * no choice yet (or a void one): asked on every page until there is
    isBannerShown: isAvailable && (stored === null || isReopened),
    accept: () => choose(EAnalyticsConsent.GRANTED),
    reject: () => choose(EAnalyticsConsent.DENIED),
    setGranted: (isGranted: boolean) =>
      choose(isGranted ? EAnalyticsConsent.GRANTED : EAnalyticsConsent.DENIED),
    openBanner: reopen,
  };
}
