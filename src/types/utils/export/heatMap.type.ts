import type { TBbox, TCellBounds, TDatasetAttribution, TPolygon } from "@/types";

export type THeatmapExportStat = {
  label: string;
  value: string;
  subtitle?: string;
};

export type THeatmapExportCell = {
  bounds: TCellBounds;
  color: string;
};

export type THeatmapExportSelection =
  { kind: "bbox"; bounds: TBbox } | { kind: "polygon"; vertices: TPolygon };

export type THeatmapExportMapSection = {
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
