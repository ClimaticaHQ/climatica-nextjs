import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type {
  EFilterApplyMode,
  EFilterAvailability,
  EFilterChoice,
  EFilterNoteVariant,
  EFilterKey,
  EFilterNavigation,
  EFilterPlacement,
  EFilterView,
} from "@/enums";
import type { TCellSize, TDataset, TMonthFilter, TVariable } from "../domain";
import type { TBbox } from "../hooks/heatmap.type";
import type { TDatasetSelections } from "../stores/datasetSelectionStore.type";

export type TFilterUnavailableReason =
  EFilterAvailability.WALTER_LIETH | EFilterAvailability.HEAT_MAP;

export type TGridSizeChoice = TCellSize | null;

export type TGridSizeContext = { dataset: TDataset; climatePeriod: TClimatePeriod };

export type TPeriodGridSize = { climatePeriod: TClimatePeriod; gridSize: TCellSize };

export type TFilters = {
  [EFilterKey.DATASET]: TDataset;
  [EFilterKey.CLIMATE_PERIOD]: TClimatePeriod;
  [EFilterKey.WEATHER_YEAR]: number;
  [EFilterKey.VARIABLES]: TVariable[];
  [EFilterKey.GRID_SIZE]: TGridSizeChoice;
  [EFilterKey.MONTHS]: TMonthFilter;
  [EFilterKey.CLIMATE_PERIOD_A]: TClimatePeriod;
  [EFilterKey.CLIMATE_PERIOD_B]: TClimatePeriod;
  [EFilterKey.WEATHER_PERIODS]: number[];
};

export type TFilterOption<TValue> = TValue extends readonly (infer TElement)[] ? TElement : TValue;

export type TFilterCodec<TValue> = {
  parse: (params: URLSearchParams) => TValue | null;
  encode: (value: TValue) => string;
};

export type TFilterConfig<K extends EFilterKey> = {
  key: K;
  param: string;
  legacyParams?: readonly string[];
  labelKey: string;
  choice: EFilterChoice;
  placement: EFilterPlacement;
  views: readonly EFilterView[];
  unavailableWhen?: readonly TFilterUnavailableReason[];
  dataset?: TDataset;
  defaultValue: TFilters[K];
  options?: readonly TFilterOption<TFilters[K]>[];
};

export type TFiltersConfig = { [K in EFilterKey]: TFilterConfig<K> };

export type TFilterCodecs = { [K in EFilterKey]: TFilterCodec<TFilters[K]> };

export type TFilterAvailabilityContext = {
  view: EFilterView;
  dataset: TDataset;
  isWalterLieth: boolean;
};

export type TFilterOptionContext = {
  view: EFilterView;
  dataset: TDataset;
  climatePeriod: TClimatePeriod;
};

export type TFilterUnavailabilityChecks = Record<
  TFilterUnavailableReason,
  (context: TFilterAvailabilityContext) => boolean
>;

export type TFilterNavigationModes = Record<EFilterApplyMode, EFilterNavigation>;

export type TFilterUnavailableLayout = {
  isNoteFirst: boolean;
  noteVariant: EFilterNoteVariant;
  noteClassName: string;
};

export type TFilterUnavailableLayouts = Record<TFilterUnavailableReason, TFilterUnavailableLayout>;

export type TFilterNote = {
  textKey: string;
  variant: EFilterNoteVariant;
};

export type TFilterNoteRule = {
  isShown: (context: TFilterAvailabilityContext) => boolean;
  note: TFilterNote;
};

export type TFilterChangeHandler = <K extends EFilterKey>(key: K, value: TFilters[K]) => void;

export type TFilterPageContext = {
  view: EFilterView;
  isWalterLieth: boolean;
  heatmapBbox: TBbox | null;
};

export type TTranslate = (key: string, values?: Record<string, string | number>) => string;

export type TFilterChipFormatters = {
  [K in EFilterKey]: (value: TFilters[K], t: TTranslate) => string;
};

export type TFilterChip = {
  key: EFilterKey;
  value: string;
  ariaLabel: string;
  isChanged: boolean;
  isDisabled: boolean;
};

export type TClimatePeriodPair = Pick<
  TFilters,
  EFilterKey.CLIMATE_PERIOD_A | EFilterKey.CLIMATE_PERIOD_B
>;

export type TRestoreDatasetSelectionArgs = {
  next: TFilters;
  previousDataset: TDataset;
  applied: TFilters;
  selections: TDatasetSelections;
};

export type TRestoreFilterSources = {
  applied: TFilters;
  remembered: TFilters;
  leftAs: TFilters;
};
