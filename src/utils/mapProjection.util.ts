import { SLIPPY_MAP_TILE_CONFIG } from "@/constants";
import type { TCellBounds, TPixelPoint, TTileRange, TTileZoomResolution } from "@/types";

/** no leaflet import: Leaflet touches window on import, and this runs in SSR and the export */
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

export function projectToMapPixel(
  lat: number,
  lng: number,
  zoom: number,
  origin: TPixelPoint,
): TPixelPoint {
  const world = projectLatLngToPixel(lat, lng, zoom);
  return { x: world.x - origin.x, y: world.y - origin.y };
}

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
