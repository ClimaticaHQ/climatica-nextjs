import { SLIPPY_MAP_TILE_CONFIG } from "@/constants";
import type { TCellBounds, TPixelPoint, TTileRange, TTileZoomResolution } from "@/types";

/**
 * Standard Web Mercator slippy-map projection (OSM/Google tiling scheme) — pure
 * math, no `leaflet` import. Leaflet itself touches `window` on import, which
 * breaks anywhere this needs to run outside a mounted map (SSR, or here, a
 * from-scratch SVG export built without ever creating a Leaflet instance).
 */
export function projectLatLngToPixel(
  lat: number,
  lng: number,
  zoom: number,
  tileSizePx: number = SLIPPY_MAP_TILE_CONFIG.tileSizePx,
): TPixelPoint {
  const worldSize = tileSizePx * 2 ** zoom;
  const x = ((lng + 180) / 360) * worldSize;

  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * worldSize;

  return { x, y };
}

/** Inclusive tile index range covering a world-pixel rect at `zoom`, clamped to
 * the valid [0, 2^zoom - 1] grid so a rect touching the poles/antimeridian edge
 * doesn't request an out-of-range tile. */
export function computeTileRangeFromPixelBounds(
  minPx: TPixelPoint,
  maxPx: TPixelPoint,
  zoom: number,
  tileSizePx: number = SLIPPY_MAP_TILE_CONFIG.tileSizePx,
): TTileRange {
  const maxTileIndex = 2 ** zoom - 1;
  const clamp = (n: number) => Math.max(0, Math.min(maxTileIndex, n));

  return {
    minX: clamp(Math.floor(minPx.x / tileSizePx)),
    maxX: clamp(Math.floor(maxPx.x / tileSizePx)),
    minY: clamp(Math.floor(minPx.y / tileSizePx)),
    maxY: clamp(Math.floor(maxPx.y / tileSizePx)),
  };
}

/** Inclusive tile index range covering `bbox` at `zoom`. */
export function computeTileRange(
  bbox: TCellBounds,
  zoom: number,
  tileSizePx: number = SLIPPY_MAP_TILE_CONFIG.tileSizePx,
): TTileRange {
  const topLeft = projectLatLngToPixel(bbox.north, bbox.west, zoom, tileSizePx);
  const bottomRight = projectLatLngToPixel(bbox.south, bbox.east, zoom, tileSizePx);
  return computeTileRangeFromPixelBounds(topLeft, bottomRight, zoom, tileSizePx);
}

/**
 * Highest integer zoom (0..maxZoom) at which `bbox`, expanded by `paddingRatio`
 * on every side, still fits inside a `viewportWidth` × `viewportHeight` box —
 * computed purely from the bbox, independent of any live map's current pan/zoom.
 */
export function computeFitZoom(
  bbox: TCellBounds,
  viewportWidth: number,
  viewportHeight: number,
  paddingRatio: number,
  maxZoom: number = SLIPPY_MAP_TILE_CONFIG.maxZoom,
): number {
  const availableWidth = viewportWidth * (1 - paddingRatio);
  const availableHeight = viewportHeight * (1 - paddingRatio);

  for (let zoom = maxZoom; zoom >= 0; zoom--) {
    const topLeft = projectLatLngToPixel(bbox.north, bbox.west, zoom);
    const bottomRight = projectLatLngToPixel(bbox.south, bbox.east, zoom);
    const bboxWidth = bottomRight.x - topLeft.x;
    const bboxHeight = bottomRight.y - topLeft.y;

    if (bboxWidth <= availableWidth && bboxHeight <= availableHeight) {
      return zoom;
    }
  }

  return 0;
}

/** World-pixel position of a viewport's top-left corner at `zoom`, centered on
 * (centerLat, centerLng) — the shared reference point both the map section's
 * tiles and its cell/selection overlays subtract from, so a given lat/lng
 * always lands on the exact same canvas pixel through either path. */
export function computeMapOrigin(
  centerLat: number,
  centerLng: number,
  zoom: number,
  viewportWidth: number,
  viewportHeight: number,
): TPixelPoint {
  const center = projectLatLngToPixel(centerLat, centerLng, zoom);
  return { x: center.x - viewportWidth / 2, y: center.y - viewportHeight / 2 };
}

/** A lat/lng's position on the map section canvas, relative to `origin` — the
 * one function both tile placement and cell/selection overlays call, so they
 * can never drift apart. */
export function projectToMapPixel(
  lat: number,
  lng: number,
  zoom: number,
  origin: TPixelPoint,
): TPixelPoint {
  const world = projectLatLngToPixel(lat, lng, zoom);
  return { x: world.x - origin.x, y: world.y - origin.y };
}

/**
 * Picks how many zoom levels above `fittedZoom` to fetch tiles at so the
 * basemap raster is as sharp as the vector overlays at `pixelRatio`x output
 * resolution (e.g. pixelRatio 2 -> fetch at fittedZoom + 1, draw at half size).
 * Caps at `maxZoom` — OSM has no tiles beyond it — falling back to 1:1 (no
 * sharpening) rather than requesting a zoom that doesn't exist.
 */
export function resolveTileZoom(
  fittedZoom: number,
  pixelRatio: number,
  tileSizePx: number = SLIPPY_MAP_TILE_CONFIG.tileSizePx,
  maxZoom: number = SLIPPY_MAP_TILE_CONFIG.maxZoom,
): TTileZoomResolution {
  const idealDelta = Math.round(Math.log2(pixelRatio));
  const zoomDelta = Math.max(0, Math.min(idealDelta, maxZoom - fittedZoom));

  return {
    tileZoom: fittedZoom + zoomDelta,
    zoomDelta,
    tileDrawSizePx: tileSizePx / 2 ** zoomDelta,
  };
}
