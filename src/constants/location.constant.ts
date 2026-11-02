// * the id of a place picked as typed coordinates: renamed once its place lookup answers
export const TYPED_COORDINATES_ID_PREFIX = "coords:";

// * the id of the reader's position, before its place lookup renames it
export const GEOLOCATION_ID_PREFIX = "geo:";

// * an unresolved Wikidata label ("Q12345") in a city saved before place names came from Solr —
// * not a name to show
export const WIKIDATA_ID_PATTERN = /^Q\d+$/;

// * coordinates as a place's name of last resort: "49.8397°N, 24.0297°E"
export const COORDINATE_DECIMALS = 4;
