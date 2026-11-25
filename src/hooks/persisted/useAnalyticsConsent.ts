"use client";

import { EAnalyticsConsent } from "@/enums";
import { GLOBAL_CONFIG } from "@/libs/GlobalConfig";
import { analyticsConsentStore } from "@/stores/analyticsConsentStore";
import { useConsentBannerStore } from "@/stores/consentBannerStore";
import { createConsentRecord } from "@/utils/analyticsConsent.util";
import { useIsClient } from "@/hooks/ui/useIsClient";
import { usePersistedJson } from "./usePersistedJson";

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
    isBannerShown: isAvailable && (stored === null || isReopened),
    accept: () => choose(EAnalyticsConsent.GRANTED),
    reject: () => choose(EAnalyticsConsent.DENIED),
    setGranted: (isGranted: boolean) =>
      choose(isGranted ? EAnalyticsConsent.GRANTED : EAnalyticsConsent.DENIED),
    openBanner: reopen,
  };
}
