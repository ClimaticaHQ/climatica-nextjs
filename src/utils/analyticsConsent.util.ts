import {
  ANALYTICS_CONSENT,
  APP_TITLE,
  GA_COOKIE_PATTERN,
  GA_DEFAULT_CONSENT,
  GA_DEFAULT_SETTINGS,
  GA_DISABLE_PREFIX,
  GA_PAGE_TITLES,
  GA_PAGE_VIEW_EVENT,
  GA_USER_PROPERTIES,
  LOCAL_STORAGE_KEYS,
} from "@/constants";
import { EAnalyticsConsent } from "@/enums";
import type {
  TConsentStoreArgs,
  TPageViewArgs,
  TPageViewTracker,
  TPageVisit,
  TStoredConsent,
} from "@/types";
import { createPersistedJsonStore } from "./persistedJsonStore.util";

const CONSENT_CHOICES: readonly string[] = Object.values(EAnalyticsConsent);

export function isStoredConsent(value: unknown): value is TStoredConsent {
  return (
    typeof value === "object" &&
    value !== null &&
    "choice" in value &&
    typeof value.choice === "string" &&
    CONSENT_CHOICES.includes(value.choice) &&
    "version" in value &&
    typeof value.version === "number" &&
    "decidedAt" in value &&
    typeof value.decidedAt === "number"
  );
}

export function isConsentCurrent(consent: TStoredConsent, now: number) {
  const age = now - consent.decidedAt;
  return (
    consent.version === ANALYTICS_CONSENT.VERSION && age >= 0 && age < ANALYTICS_CONSENT.MAX_AGE_MS
  );
}

export function createConsentRecord(choice: EAnalyticsConsent, now: number): TStoredConsent {
  return { choice, version: ANALYTICS_CONSENT.VERSION, decidedAt: now };
}

// * an expired or older-version choice fails isValue and reads as null, so the banner asks again
export function createConsentStore({ getStorage, getNow = Date.now }: TConsentStoreArgs = {}) {
  return createPersistedJsonStore<TStoredConsent | null>({
    key: LOCAL_STORAGE_KEYS.ANALYTICS_CONSENT,
    defaultValue: null,
    isValue: (value): value is TStoredConsent | null =>
      value === null || (isStoredConsent(value) && isConsentCurrent(value, getNow())),
    ...(getStorage ? { getStorage } : {}),
  });
}

export function getGaCookieNames(cookies: string) {
  return cookies
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim() ?? "")
    .filter((name) => GA_COOKIE_PATTERN.test(name));
}

// * GA's "auto" cookie domain is the highest one the browser accepts (.uva.es for climatica.gsic.uva.es)
export function getCookieDomains(hostname: string) {
  const labels = hostname.split(".");
  return labels.map((_, index) => labels.slice(index).join("."));
}

export function removeGaCookies(doc: Document) {
  const domains = getCookieDomains(doc.location.hostname);
  for (const name of getGaCookieNames(doc.cookie)) {
    const expired = `${name}=; Max-Age=0; path=/`;
    doc.cookie = expired;
    domains.forEach((domain) => (doc.cookie = `${expired}; domain=.${domain}`));
  }
}

// * gtag only reads Arguments objects, as its own snippet pushes them: an array is ignored
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(arguments);
}

// * no query or hash may reach Google: they carry places, coordinates and regions
export function getPageUrl(href: string) {
  if (!URL.canParse(href)) return "";
  const { origin, pathname } = new URL(href);
  return `${origin}${pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname}`;
}

export function getGaPageTitle(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return GA_PAGE_TITLES[path] ?? APP_TITLE;
}

// * must run before GA's config, so nothing is ever sent with the full URL or ad settings
export function enableAnalytics(gaId: string) {
  window[`${GA_DISABLE_PREFIX}${gaId}`] = false;
  gtag("consent", "default", GA_DEFAULT_CONSENT);
  gtag("set", {
    ...GA_DEFAULT_SETTINGS,
    page_location: getPageUrl(window.location.href),
    page_referrer: getPageUrl(document.referrer),
    page_title: APP_TITLE,
  });
}

export function setAppLanguage(locale: string) {
  gtag("set", GA_USER_PROPERTIES.COMMAND, { [GA_USER_PROPERTIES.APP_LANGUAGE]: locale });
}

// * Strict Mode's second effect run, a remount or a language switch must not resend the same page
export function createPageViewTracker(): TPageViewTracker {
  let last: string | null = null;
  return {
    visit(location): TPageVisit {
      if (location === last) return { isNew: false };
      const previous = last;
      last = location;
      return { isNew: true, previous };
    },
  };
}

// * set, not only sent, so GA's own events (scrolls, outbound clicks, downloads) carry them too
export function sendPageView({ location, referrer, title }: TPageViewArgs) {
  gtag("set", { page_location: location, page_referrer: referrer, page_title: title });
  gtag("event", GA_PAGE_VIEW_EVENT);
}

export function disableAnalytics(gaId: string) {
  window[`${GA_DISABLE_PREFIX}${gaId}`] = true;
  removeGaCookies(document);
}
