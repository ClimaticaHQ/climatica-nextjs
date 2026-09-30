import type { TBbox, TCellBounds, TDatasetAttribution, TPolygon } from "@/types";

export type THeatmapExportStat = {
  label: string;
  value: string;
  subtitle?: string;
};

/** Color is resolved at payload-build time since interpolateColor() is pure,
 * unlike the CSS-var colors in TExportChartColors. */
export type THeatmapExportCell = {
  bounds: TCellBounds;
  color: string;
};

export type THeatmapExportSelection =
  { kind: "bbox"; bounds: TBbox } | { kind: "polygon"; vertices: TPolygon };

export type THeatmapExportMapSection = {
  /** What the map view is fitted to — the bbox itself, or the polygon's bounds. */
  selectionBounds: TCellBounds;
  cells: THeatmapExportCell[];
  selection: THeatmapExportSelection;
};

export type THeatmapExportPayload = {
  headerTitle: string;
  headerSubtitle: string;
  stats: THeatmapExportStat[];
  gradientColors: string[];
  minLabel: string;
  maxLabel: string;
  mapSection: THeatmapExportMapSection;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
};
