import type { TLocationSearchProps } from "@/components/LocationSearch/LocationSearch.type";
import type {
  TBbox,
  TCellSize,
  TColorScale,
  TDataState,
  TDatasetAttribution,
  TNumberFormatter,
  TPageUpdate,
  TPolygon,
  TVariable,
  TWorldClimBoxBinding,
} from "@/types";

export type THeatMapSelectionValue =
  { kind: "bbox"; bbox: TBbox } | { kind: "polygon"; polygon: TPolygon } | { kind: "none" };

export type THeatMapUrlState = {
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

/** The region the page shows: a box or a polygon (never both), and the shape being drawn. */
export type THeatMapSelection = {
  bbox: TBbox | null;
  polygon: TPolygon | null;
  drawMode: TDrawMode;
};

export type THeatMapExportHandlers = Pick<
  TToolbarProps,
  "onExportCSV" | "onExportPNG" | "onExportSVG"
>;

export type TUseHeatMapExportArgs = {
  selection: THeatMapSelection;
  bindings: TWorldClimBoxBinding[];
  stats: THeatmapStats;
  gridSize: TCellSize;
  activeVariable: TVariable;
  colorScale: TColorScale;
  selectedMonths: number[];
  periodLabel: string;
  statSubtitle: string;
  unit: string;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
};

export type THeatMapPage = {
  state: TDataState;
  update: TPageUpdate;
  hasSelection: boolean;
  search: TLocationSearchProps;
  toolbar: TToolbarProps;
  map: TMapCanvasProps;
  stats: TStatsLegendBarProps;
  profile: TRegionalClimateProfileProps;
};

export type THeatMapViewProps = {
  page: THeatMapPage;
};

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
  gridSize: TCellSize;
  onBboxComplete: (bbox: TBbox) => void;
};

export type TBboxOutlineProps = { bbox: TBbox };

export type TPolygonDrawerProps = {
  gridSize: TCellSize;
  onPolygonComplete: (v: TPolygon) => void;
};

export type TDrawingCellCountProps = {
  /** the shape so far, [lat, lng] */
  vertices: TPolygon;
  gridSize: TCellSize;
};

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
  /** the region's cells are loading: the stats wait in their places */
  isLoading: boolean;
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
  gridSize: TCellSize;
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
