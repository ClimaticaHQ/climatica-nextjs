import type {
  TBbox,
  TCellSize,
  TColorScale,
  TVariable,
  TWikidataCity,
  TWorldClimBoxBinding,
  TWorldClimBoxResponse,
} from "@/types";

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

export type TPolygon = [number, number][];

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
  isLoading: boolean;
  isLocating: boolean;
  isClimate: boolean;
  error: Error | null;
  locationError: string | null;
  mapTarget: TMapTarget | null;
  selectedMonths: number[];
  periodLabel: string;
  profile: TRegionalProfile | null;
  isProfileLoading: boolean;
  onDrawModeChange: (mode: TDrawMode) => void;
  onBboxChange: (bbox: TBbox | null) => void;
  onPolygonChange: (polygon: TPolygon | null) => void;
  onClear: () => void;
  onCitySelect: (city: TWikidataCity) => void;
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
  isLoading: boolean;
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
