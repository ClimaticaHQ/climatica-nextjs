import type { TFilters } from "../filters";
import type { TBbox } from "./heatmap.type";

export type TFiltersDraftOptions = {
  /** the applied filters — the URL's */
  filters: TFilters;
  /** the heat map's selected box; null off the heat map, where no cell limit applies */
  heatmapBbox: TBbox | null;
};

export type TAutoApplyOptions = {
  /** changes whenever what would be applied changes */
  key: string;
  delayMs: number;
  /** read when the debounced key settles */
  shouldApply: boolean;
  onApply: () => void;
};
