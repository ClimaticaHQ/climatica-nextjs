import { COORDINATE_DECIMALS, WIKIDATA_ID_PATTERN } from "@/constants";
import type { TCity } from "@/types";

/** "49.8397°N, 24.0297°E" — hemispheres as letters, never signs. */
export function formatLatLng(lat: number, lng: number) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(COORDINATE_DECIMALS)}°${latDir}, ${Math.abs(lng).toFixed(COORDINATE_DECIMALS)}°${lngDir}`;
}

/**
 * The name to show for a place — never empty: its label, or (an unresolved Wikidata id, or
 * no label) its description, or as a last resort its coordinates.
 */
export function getLocationName({
  label,
  description,
  lat,
  lng,
}: Pick<TCity, "label" | "description" | "lat" | "lng">) {
  const name = label.trim();
  if (name && !WIKIDATA_ID_PATTERN.test(name)) return name;
  return description.trim() || formatLatLng(lat, lng);
}
