import type { TClimatePeriod } from "@/constants";
import { DATASETS } from "@/constants";
import type { TCellSize, TDataset, TMonthFilter, TVariable } from "@/types";
import type { TCellSizeOption } from "@/types/ui/cell-size";

export type TSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type TDraftFilters = {
  dataset: TDataset;
  climatePeriod: TClimatePeriod;
  weatherYear: number;
  variables: TVariable[];
  gridSize: TCellSize;
  months: TMonthFilter;
};

export type TSidebarFilters = {
  dataset: TDataset;
  yearStart: number;
  yearEnd: number;
  variables: TVariable[];
  grid: TCellSize;
  months: TMonthFilter;
  cellSizeOptions: readonly TCellSizeOption[];
};

export type TSidebarHandlers = {
  onDatasetChange: (dataset: TDataset) => void;
  onYearStartChange: (year: number) => void;
  onYearEndChange: (year: number) => void;
  onVariableToggle: (variable: TVariable) => void;
  onGridChange: (grid: TCellSize) => void;
  onMonthToggle: (month: number) => void;
  onAllMonthsSelect: () => void;
  onApply: () => void;
};

export type TSidebarFiltersState = {
  dataset: (typeof DATASETS)[keyof typeof DATASETS];
  setDataset: (dataset: (typeof DATASETS)[keyof typeof DATASETS]) => void;
  periodWindowStart: string;
  setPeriodWindowStart: (value: string) => void;
  variables: TVariable[];
  toggleVariable: (variable: TVariable) => void;
  grid: TCellSize;
  setGrid: (size: TCellSize) => void;
  months: TMonthFilter;
  toggleMonth: (month: number) => void;
  selectAllMonths: () => void;
  cellSizeOptions: readonly TCellSizeOption[];
  handleApply: () => void;
};

export type TDraftErrors = Record<string, string>;
