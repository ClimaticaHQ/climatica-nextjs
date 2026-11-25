import { APP_TITLE, DOCUMENT_TITLE } from "@/constants";
import type { TBuildDocumentTitleArgs } from "@/types";

export function isDisplayablePlaceLabel(label: string) {
  const trimmed = label.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.startsWith(DOCUMENT_TITLE.URL_PLACEHOLDER_PREFIX) &&
    !DOCUMENT_TITLE.WIKIDATA_ID.test(trimmed)
  );
}

export function buildDocumentTitle({ pageTitle, places, details }: TBuildDocumentTitleArgs) {
  const isKnown = places.length > 0 && places.every(isDisplayablePlaceLabel);
  if (!isKnown) return `${pageTitle} | ${APP_TITLE}`;
  const place = places.map((label) => label.trim()).join(DOCUMENT_TITLE.PLACES_SEPARATOR);
  return details === null
    ? `${place} | ${APP_TITLE}`
    : `${place}${DOCUMENT_TITLE.SEPARATOR}${details} | ${APP_TITLE}`;
}
