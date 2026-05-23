import { COORDINATE_REGEX, LAT_BOUNDS, LNG_BOUNDS } from "@/constants";
import type { TCoordinates } from "@/types";

export function tryParseCoords(input: string): TCoordinates | null {
  const m = COORDINATE_REGEX.exec(input.trim());
  if (!m) return null;

  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (isNaN(lat) || isNaN(lng)) return null;

  if (lat < LAT_BOUNDS.MIN || lat > LAT_BOUNDS.MAX) return null;
  if (lng < LNG_BOUNDS.MIN || lng > LNG_BOUNDS.MAX) return null;

  return { lat, lng };
}
