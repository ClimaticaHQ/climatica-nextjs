import { parseCoordinates } from "@/app/api/@utils/parseCoordinates.util";
import { readFile } from "node:fs/promises";
import {
  CONTINENTS,
  LATITUDE_DECIMALS,
  PLACE_MATCH_TOLERANCE_DEG,
  PLACES_FILE,
} from "./benchmark.constant";
import type { TContinent, TPlace, TPlacesSummary } from "./benchmark.type";
import { latexEscape } from "./benchmarkOutput.util";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isContinent = (value: unknown): value is TContinent =>
  CONTINENTS.some((continent) => continent === value);

function isPlace(value: unknown): value is TPlace {
  if (!isRecord(value)) return false;
  const { name, country, continent, lat, lng, geonameid, searchQuery, sample } = value;
  return (
    typeof name === "string" &&
    typeof country === "string" &&
    isContinent(continent) &&
    typeof lat === "number" &&
    typeof lng === "number" &&
    typeof geonameid === "number" &&
    typeof searchQuery === "string" &&
    (sample === "original" || sample === "added")
  );
}

export async function loadPlaces(): Promise<TPlace[]> {
  const data: unknown = JSON.parse(await readFile(PLACES_FILE, "utf8"));
  if (!Array.isArray(data) || !data.every(isPlace))
    throw new Error(`${PLACES_FILE}: not a place list`);
  return data;
}

const isAt = (place: TPlace, lat: number, lng: number) =>
  Math.abs(place.lat - lat) <= PLACE_MATCH_TOLERANCE_DEG &&
  Math.abs(place.lng - lng) <= PLACE_MATCH_TOLERANCE_DEG;

/** The city a URL asks about: by its lat / lng, its coordinate query, or its search query */
export function placeOf(url: string, places: readonly TPlace[]): string | null {
  const { searchParams } = new URL(url);
  const q = searchParams.get("q");
  const point = q === null ? null : parseCoordinates(q);
  const lat = point?.lat ?? Number(searchParams.get("lat") ?? NaN);
  const lng = point?.lng ?? Number(searchParams.get("lng") ?? NaN);
  const match =
    Number.isFinite(lat) && Number.isFinite(lng)
      ? places.find((place) => isAt(place, lat, lng))
      : places.find((place) => place.searchQuery === q);
  return match?.name ?? null;
}

export function summarizePlaces(places: readonly TPlace[]): TPlacesSummary {
  const byLat = [...places].sort((a, b) => a.lat - b.lat);
  const lowest = byLat[0];
  const highest = byLat.at(-1);
  return {
    total: places.length,
    perContinent: Object.fromEntries(
      CONTINENTS.map((continent) => [
        continent,
        places.filter((place) => place.continent === continent).length,
      ]),
    ),
    northern: places.filter((place) => place.lat >= 0).length,
    southern: places.filter((place) => place.lat < 0).length,
    eastern: places.filter((place) => place.lng >= 0).length,
    western: places.filter((place) => place.lng < 0).length,
    minLat: { place: lowest?.name ?? "", lat: lowest?.lat ?? 0 },
    maxLat: { place: highest?.name ?? "", lat: highest?.lat ?? 0 },
  };
}

const formatLatitude = (lat: number) =>
  `${Math.abs(lat).toFixed(LATITUDE_DECIMALS)}\\textdegree{}${lat < 0 ? "S" : "N"}`;

/**
 * The paper's footnote: every city with its country, grouped by continent, as one LaTeX
 * sentence; then the sample in numbers. UTF-8 names (São Paulo): LaTeX reads them natively since
 * 2018 (inputenc utf8 is the default).
 */
export function toPlacesLatex(places: readonly TPlace[], summary: TPlacesSummary): string {
  const groups = CONTINENTS.map((continent) => {
    const cities = places
      .filter((place) => place.continent === continent)
      .sort((a, b) => a.name.localeCompare(b.name, "en"))
      .map((place) => `${latexEscape(place.name)} (${latexEscape(place.country)})`);
    return `${continent}: ${cities.join(", ")}`;
  });
  const counts = CONTINENTS.map(
    (continent) => `${summary.perContinent[continent] ?? 0} in ${continent}`,
  );
  return [
    `% ${summary.total} cities: ${counts.join(", ")}`,
    `% ${summary.northern} northern / ${summary.southern} southern hemisphere; ${summary.eastern} eastern / ${summary.western} western`,
    `% latitude ${summary.minLat.lat} (${summary.minLat.place}) to ${summary.maxLat.lat} (${summary.maxLat.place})`,
    `${groups.join("; ")}.`,
    "",
    `The ${summary.total} cities span ${CONTINENTS.length} continents (${counts.join(", ")}), ${summary.northern} in the northern and ${summary.southern} in the southern hemisphere, from ${formatLatitude(summary.minLat.lat)} (${latexEscape(summary.minLat.place)}) to ${formatLatitude(summary.maxLat.lat)} (${latexEscape(summary.maxLat.place)}).`,
    "",
  ].join("\n");
}
