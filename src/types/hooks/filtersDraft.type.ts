import type { TFilters } from "../filters";
import type { TBbox } from "./heatmap.type";

export type TFiltersDraftOptions = {
  filters: TFilters;
  heatmapBbox: TBbox | null;
};

export type TAutoApplyOptions = {
  key: string;
  delayMs: number;
  shouldApply: boolean;
  onApply: () => void;
};
