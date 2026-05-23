/**
 * Parses a WKT Point geometry string into lat/lng coordinates
 * @param wkt WKT Point string in format "Point(lng lat)"
 * @returns Object with lat and lng properties, or null if parsing fails
 */
export function parseWktPoint(wkt: string): { lat: number; lng: number } | null {
  const match = /^Point\(([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\)$/i.exec(wkt.trim());
  if (!match) return null;

  const lng = parseFloat(match[1]);
  const lat = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
}

/**
 * Safely accesses a property from a record that may be undefined
 * @param obj Record to access
 * @param key Property key to access
 * @returns Property value or undefined
 */
export function safeGetProperty<T extends Record<string, unknown>>(
  obj: T | undefined,
  key: keyof T,
): unknown {
  return obj?.[key];
}

/**
 * Validates that a value is a non-empty string
 * @param value Value to check
 * @returns true if value is a non-empty string
 */
export function isValidString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
