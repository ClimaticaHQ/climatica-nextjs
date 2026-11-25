import type { PathOptions } from "leaflet";
import { REFERRER_POLICY } from "./referrerPolicy.constant";

export const MAP_MARKER = {
  FILL: "var(--color-brand)",
  OUTLINE: "var(--color-map-marker-border)",
  SHADOW: "var(--color-map-marker-shadow)",
} as const;

export const RASTER_SELECTION_PATH_OPTIONS: PathOptions = {
  color: "var(--color-brand)",
  fillColor: "var(--color-brand)",
  fillOpacity: 0.2,
  opacity: 1,
  weight: 2,
};

/** no {s} subdomains: OSM deprecated a/b/c, and the export's tile fetches hit the exact URLs the map requested */
export const MAP_TILE_CONFIG = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  referrerPolicy: REFERRER_POLICY,
} as const;

export const CLIMATE_MAP_CONFIG = {
  ...MAP_TILE_CONFIG,
  zoom: 12,
} as const;

export const HEATMAP_MAP_CONFIG = {
  ...MAP_TILE_CONFIG,
  zoom: 10,
} as const;

export const SLIPPY_MAP_TILE_CONFIG = {
  tileSizePx: 256,
  maxZoom: 19,
} as const;
