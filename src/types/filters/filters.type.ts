import type { TClimatePeriod } from "@/constants/worldclim.constant";
import type {
  EFilterApplyMode,
  EFilterAvailability,
  EFilterChoice,
  EFilterHintVariant,
  EFilterKey,
  EFilterNavigation,
  EFilterPlacement,
  EFilterView,
} from "@/enums";
import type { TCellSize, TDataset, TMonthFilter, TVariable } from "../domain";
import type { TBbox } from "../hooks/heatmap.type";

/** The availabilities that render a filter disabled, with an explanation. */
export type TFilterUnavailableReason =
  EFilterAvailability.WALTER_LIETH | EFilterAvailability.HEAT_MAP;

/** Every filter value — what the URL carries, parsed and normalized. */
export type TFilters = {
  [EFilterKey.DATASET]: TDataset;
  [EFilterKey.CLIMATE_PERIOD]: TClimatePeriod;
  [EFilterKey.WEATHER_YEAR]: number;
  [EFilterKey.VARIABLES]: TVariable[];
  [EFilterKey.GRID_SIZE]: TCellSize;
  [EFilterKey.MONTHS]: TMonthFilter;
  [EFilterKey.CLIMATE_PERIOD_A]: TClimatePeriod;
  [EFilterKey.CLIMATE_PERIOD_B]: TClimatePeriod;
  [EFilterKey.WEATHER_PERIODS]: number[];
};

/** One option of a filter: the value itself, or one element of a multi-choice list. */
export type TFilterOption<TValue> = TValue extends readonly (infer TElement)[] ? TElement : TValue;

/** A filter's URL read/write pair: null from parse means absent or invalid — the default. */
export type TFilterCodec<TValue> = {
  parse: (params: URLSearchParams) => TValue | null;
  encode: (value: TValue) => string;
};

export type TFilterConfig<K extends EFilterKey> = {
  key: K;
  /** the param written to the URL */
  param: string;
  /** older params still read from links, never written */
  legacyParams?: readonly string[];
  labelKey: string;
  choice: EFilterChoice;
  placement: EFilterPlacement;
  views: readonly EFilterView[];
  /** when the filter is shown but disabled — each reason checked against the context, in order */
  unavailableWhen?: readonly TFilterUnavailableReason[];
  /** the only dataset the filter applies to; absent = both */
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
  /** the whole section greys out and ignores input, instead of disabling its controls */
  isDimmed: boolean;
  /** the explanation goes above the controls instead of below */
  isNoteFirst: boolean;
  noteVariant: EFilterHintVariant;
  noteClassName: string;
};

export type TFilterUnavailableLayouts = Record<TFilterUnavailableReason, TFilterUnavailableLayout>;

/** A note under a filter, translated where it's rendered. */
export type TFilterHint = {
  textKey: string;
  variant: EFilterHintVariant;
};

/** A note shown under a filter when its context matches. */
export type TFilterHintRule = {
  isShown: (context: TFilterAvailabilityContext) => boolean;
  hint: TFilterHint;
};

/** An option of a filter, and whether it can be picked in the current context. */
export type TFilterOptionState<TValue> = {
  value: TValue;
  isDisabled: boolean;
};

export type TFilterChangeHandler = <K extends EFilterKey>(key: K, value: TFilters[K]) => void;

/** What the current page tells the filters, beyond their values. */
export type TFilterPageContext = {
  view: EFilterView;
  isWalterLieth: boolean;
  /** the heat map's selected box, when the page is the heat map and one is selected */
  heatmapBbox: TBbox | null;
};

/** A translation function — next-intl's t, or a stub in tests. */
export type TTranslate = (key: string, values?: Record<string, string | number>) => string;

/** How each filter's value reads on a chip. */
export type TFilterChipFormatters = {
  [K in EFilterKey]: (value: TFilters[K], t: TTranslate) => string;
};

/** One mobile chip: the filter, its value as shown, and whether that differs from the default. */
export type TFilterChip = {
  key: EFilterKey;
  value: string;
  ariaLabel: string;
  isChanged: boolean;
  /** shown but not changeable here (Walter-Lieth) — tapping it explains why */
  isDisabled: boolean;
};

/** What both mobile filter sheets get from the bar that owns them. */
export type TFilterSheetProps = {
  isOpen: boolean;
  /** the applied filters — each opening starts from them */
  filters: TFilters;
  context: TFilterAvailabilityContext;
  heatmapBbox: TBbox | null;
  availablePeriods: readonly TClimatePeriod[] | null;
  /** closed without applying — the edits are dropped */
  onClose: () => void;
  onApply: (next: TFilters) => void;
};

export type TFullFiltersSheetProps = TFilterSheetProps & {
  /** leaves Walter-Lieth — offered next to its note on variables and months */
  onSwitchToStandardChart: () => void;
};

/** Compare Periods' two climate periods, changed together (a swap is one change). */
export type TClimatePeriodPair = Pick<
  TFilters,
  EFilterKey.CLIMATE_PERIOD_A | EFilterKey.CLIMATE_PERIOD_B
>;

/** What can be done about a filter being disabled, per reason — e.g. leave Walter-Lieth. */
export type TFilterUnavailableActions = Partial<Record<TFilterUnavailableReason, () => void>>;

/** The label of the way out of each disabling reason that has one. */
export type TFilterUnavailableActionLabels = Partial<
  Record<TFilterUnavailableReason, (t: TTranslate) => string>
>;
