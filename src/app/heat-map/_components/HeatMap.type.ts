import type {
  TBbox,
  TCellSize,
  TCity,
  TColorScale,
  TDatasetAttribution,
  TDatasetPeriodUrlValue,
  TNumberFormatter,
  TPolygon,
  TVariable,
  TWorldClimBoxBinding,
  TWorldClimBoxResponse,
} from "@/types";

export type THeatMapSelectionValue =
  { kind: "bbox"; bbox: TBbox } | { kind: "polygon"; polygon: TPolygon } | { kind: "none" };

export type THeatMapUrlState = {
  datasetPeriod: TDatasetPeriodUrlValue;
  variables: TVariable[];
  gridSize: TCellSize;
  selection: THeatMapSelectionValue;
};

export type TLooseBinding = Record<string, unknown>;

export type TSumAndCount = {
  sum: number;
  count: number;
};

export type TRegionalProfile = {
  meanTemp: number;
  annualPrecip: number;
  aridMonths: number;
  martonneIndex: number | null;
};

export type TDrawMode = "none" | "bbox" | "polygon";

export type TMapTarget = { lat: number; lng: number };

export type THeatmapStats = {
  min: number;
  max: number;
  avg: number;
  median: number;
  stdDev: number;
  count: number;
};

export type TRegionHeatmapViewProps = {
  bbox: TBbox | null;
  polygon: TPolygon | null;
  pixels: TWorldClimBoxResponse | null;
  gridSize: TCellSize;
  activeVariable: TVariable;
  colorScale: TColorScale;
  drawMode: TDrawMode;
  /** the first load of a selection — no cells to show yet */
  isLoading: boolean;
  /** any load, also while the previous selection's cells are still shown */
  isFetching: boolean;
  isLocating: boolean;
  isClimate: boolean;
  error: Error | null;
  locationError: string | null;
  mapTarget: TMapTarget | null;
  selectedMonths: number[];
  periodLabel: string;
  profile: TRegionalProfile | null;
  isProfileLoading: boolean;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  onDrawModeChange: (mode: TDrawMode) => void;
  onBboxChange: (bbox: TBbox | null) => void;
  onPolygonChange: (polygon: TPolygon | null) => void;
  onClear: () => void;
  onCitySelect: (city: TCity) => void;
  onLocate: () => void;
  onClearLocationError: () => void;
};

// Sub-component prop types

export type THeatmapLayerProps = {
  bindings: TWorldClimBoxBinding[];
  gridSize: string;
  scale: TColorScale;
  unit: string;
  bbox: TBbox | null;
  polygon: TPolygon | null;
  selectedMonths: number[];
};

export type TMapNavigatorProps = { target: TMapTarget | null };

export type TMapFitterProps = { bbox: TBbox | null };

export type TBboxDrawerProps = {
  isDrawMode: boolean;
  onBboxComplete: (bbox: TBbox) => void;
};

export type TBboxOutlineProps = { bbox: TBbox };

export type TPolygonDrawerProps = { onPolygonComplete: (v: TPolygon) => void };

export type TPolygonOutlineProps = { vertices: TPolygon };

export type TToolbarProps = {
  drawMode: TDrawMode;
  hasSelection: boolean;
  onBboxModeToggle: () => void;
  onPolygonModeToggle: () => void;
  onClear: () => void;
  onExportCSV?: (() => void) | undefined;
  onExportPNG?: (() => Promise<void>) | undefined;
  onExportSVG?: (() => void | Promise<void>) | undefined;
};

export type TStatsLegendBarProps = {
  hasData: boolean;
  stats: THeatmapStats;
  unit: string;
  scale: TColorScale;
  statSubtitle: string;
  avgTooltip: string;
};

export type TMapCanvasProps = {
  bbox: TBbox | null;
  polygon: TPolygon | null;
  drawMode: TDrawMode;
  gridSize: string;
  colorScale: TColorScale;
  unit: string;
  mapTarget: TMapTarget | null;
  bindings: TWorldClimBoxBinding[];
  selectedMonths: number[];
  onBboxComplete: (bbox: TBbox) => void;
  onPolygonComplete: (polygon: TPolygon) => void;
};

export type TRegionalClimateProfileProps = {
  profile: TRegionalProfile | null;
  isLoading: boolean;
  isClimate: boolean;
  periodLabel: string;
  cellCount: number;
};

/** A heat map cell's popup: its value and where the cell is. */
export type TPopupContentArgs = {
  value: number;
  unit: string;
  center: { lat: number; lng: number };
  formatNumber: TNumberFormatter;
};
