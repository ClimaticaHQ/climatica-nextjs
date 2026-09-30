import type { PathOptions } from "leaflet";

export const RASTER_SELECTION_PATH_OPTIONS: PathOptions = {
  color: "var(--color-primary)",
  fillColor: "var(--color-primary)",
  fillOpacity: 0.2,
  opacity: 1,
  weight: 2,
};

/** Shared base — tile source is identical across every Leaflet map in the app.
 * No {s} subdomains: OSM deprecated a/b/c and now serves everything from the
 * bare hostname, which also means the export's tile fetches always hit the
 * exact URL the live map already requested (no subdomain to guess/rotate). */
export const MAP_TILE_CONFIG = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
} as const;

/** LeafletMap.tsx — single-point city view (climate-statistics, compare pages). */
export const CLIMATE_MAP_CONFIG = {
  ...MAP_TILE_CONFIG,
  zoom: 12,
} as const;

/** MapCanvas.tsx — broader region view for bbox/polygon selection. */
export const HEATMAP_MAP_CONFIG = {
  ...MAP_TILE_CONFIG,
  zoom: 10,
} as const;

/** Standard slippy-map tiling scheme (OSM, Google, etc.) — mapProjection.util.ts's
 * Web Mercator math and the heat-map export's tile fetcher both key off these. */
export const SLIPPY_MAP_TILE_CONFIG = {
  tileSizePx: 256,
  maxZoom: 19,
} as const;
