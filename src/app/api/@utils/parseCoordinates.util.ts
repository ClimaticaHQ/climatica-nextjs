import { COORDINATE_REGEX } from "@/constants";
import type { TCoordinates } from "@/types";

export function parseCoordinates(q: string): TCoordinates | null {
  const match = COORDINATE_REGEX.exec(q.trim());
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}
