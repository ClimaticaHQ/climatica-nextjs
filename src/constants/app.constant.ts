import { TIME } from "./time.constant";

export const APP_TITLE = "Climatica";

export const DOCUMENT_TITLE = {
  SEPARATOR: " · ",
  PLACES_SEPARATOR: " vs ",
  URL_PLACEHOLDER_PREFIX: "url:",
  WIKIDATA_ID: /^Q\d+$/,
} as const;

// * the results scroll into view once the chart has drawn
export const SCROLL_TO_RESULTS_DELAY_MS = TIME.IN_MILLISECONDS.SECOND * 2;

export const WEATHER_YEARS_SEPARATOR = ", ";
