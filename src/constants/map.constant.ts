import type { PathOptions } from "leaflet";

export const RASTER_SELECTION_PATH_OPTIONS: PathOptions = {
  color: "var(--color-primary)",
  fillColor: "var(--color-primary)",
  fillOpacity: 0.2,
  opacity: 1,
  weight: 2,
};

/** Shared base — tile source is identical across every Leaflet map in the app. */
export const MAP_TILE_CONFIG = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
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
