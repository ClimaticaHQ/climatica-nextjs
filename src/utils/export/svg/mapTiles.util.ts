import { HEATMAP_EXPORT_TILE_LIMITS, MAP_TILE_CONFIG } from "@/constants";

function buildTileUrl(x: number, y: number, z: number): string {
  return MAP_TILE_CONFIG.url
    .replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("mapTiles: FileReader did not return a string"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("mapTiles: FileReader failed"));
    reader.readAsDataURL(blob);
  });
}

/** external hrefs don't load once the SVG is rasterized: every tile is inlined */
export async function fetchTileDataUrl(x: number, y: number, z: number): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEATMAP_EXPORT_TILE_LIMITS.fetchTimeoutMs);

  try {
    // * our origin as the Referer (OSM tile usage policy); the default cache mode, so the live map's tiles are reused
    const response = await fetch(buildTileUrl(x, y, z), {
      signal: controller.signal,
      referrerPolicy: MAP_TILE_CONFIG.referrerPolicy,
    });
    // OSM signals a policy block with this header on a 200 whose body is the notice: treated as a failed fetch
    if (!response.ok || response.headers.has("x-blocked")) return null;
    return await readBlobAsDataUrl(await response.blob());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchTileGrid(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  zoom: number,
): Promise<Map<string, string | null>> {
  const coords: { x: number; y: number }[] = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      coords.push({ x, y });
    }
  }

  const dataUrls = await Promise.all(coords.map(({ x, y }) => fetchTileDataUrl(x, y, zoom)));

  const tiles = new Map<string, string | null>();
  coords.forEach(({ x, y }, i) => tiles.set(`${x},${y}`, dataUrls[i] ?? null));
  return tiles;
}
