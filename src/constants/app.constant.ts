import { TIME } from "./time.constant";

export const APP_TITLE = "Climatica";

export const DOCUMENT_TITLE = {
  SEPARATOR: " · ",
  PLACES_SEPARATOR: " vs ",
  // * a URL city before its lookup, and a bare Wikidata id: placeholders, not names
  URL_PLACEHOLDER_PREFIX: "url:",
  WIKIDATA_ID: /^Q\d+$/,
} as const;

// * after a city is picked, the results scroll into view once the chart has drawn
export const SCROLL_TO_RESULTS_DELAY_MS = TIME.IN_MILLISECONDS.SECOND * 2;

// * the compared weather years in a line of text: "2021, 1967, 1990"
export const WEATHER_YEARS_SEPARATOR = ", ";
