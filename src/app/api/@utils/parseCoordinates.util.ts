import { COORDINATE_REGEX } from "@/constants";

export function parseCoordinates(q: string): { lat: number; lng: number } | null {
  if (!COORDINATE_REGEX.test(q.trim())) return null;
  const [lat, lng] = q.split(",").map(Number);

  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
}
