import type { EAnalyticsConsent } from "@/enums";
import type { TKeyValueStorage } from "./persistedStore.type";

export type TStoredConsent = {
  choice: EAnalyticsConsent;
  version: number;
  decidedAt: number;
};

export type TConsentStoreArgs = {
  getStorage?: () => TKeyValueStorage | null;
  getNow?: () => number;
};

export type TPageViewArgs = {
  // * origin and path only (getPageUrl): no query string may reach Google
  location: string;
  referrer: string;
  // * GA_PAGE_TITLES, never document.title: page titles can contain place names
  title: string;
};

export type TPageVisit = { isNew: true; previous: string | null } | { isNew: false };

export type TPageViewTracker = {
  visit: (location: string) => TPageVisit;
};
