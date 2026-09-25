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

/**
 * Fetches one tile and inlines it as a data URI — external hrefs don't load
 * once the SVG is rasterized to PNG, so every tile image must be embedded.
 * `crossOrigin` on the live TileLayer (MapCanvas.tsx) means this often hits
 * the browser's HTTP cache instead of re-downloading. Returns null (never
 * throws) on any failure — a slow, missing or errored tile just means the
 * export falls back to a neutral rect for that one cell, not an aborted export.
 */
export async function fetchTileDataUrl(x: number, y: number, z: number): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEATMAP_EXPORT_TILE_LIMITS.fetchTimeoutMs);

  try {
    const response = await fetch(buildTileUrl(x, y, z), { signal: controller.signal });
    // OSM signals a tile-usage-policy block via this header on an otherwise-200
    // response whose body is a PNG *of* the block notice, not a non-2xx status —
    // treat it the same as a failed fetch rather than embedding that image.
    if (!response.ok || response.headers.has("x-blocked")) return null;
    return await readBlobAsDataUrl(await response.blob());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Fetches every tile in `[minX..maxX] × [minY..maxY]` at `zoom` in parallel,
 * keyed by "x,y". A failed/timed-out tile's entry is null, not omitted, so
 * callers can still iterate the full expected grid and fall back per-tile. */
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
