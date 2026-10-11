import type { TClimatePeriod } from "@/constants";
import type { useFiltersDraft } from "@/hooks/filters/useFiltersDraft";
import type {
  EBottomSheetHeight,
  EFilterApplyMode,
  EFilterAvailability,
  EFilterKey,
  EFilterNoteVariant,
  EFiltersSheetMode,
} from "@/enums";
import type {
  TBbox,
  TClimatePeriodPair,
  TFilterAvailabilityContext,
  TFilterChangeHandler,
  TFilters,
  TFilterUnavailableReason,
  TTranslate,
} from "@/types";
import type { ComponentType, ReactNode } from "react";

export type TFilterSectionProps = {
  title?: string;
  /** a disabled section explains why; the heat map greys it out as a whole */
  availability?: EFilterAvailability;
  className?: string;
  children: ReactNode;
};

export type TFilterNoteAction = {
  label: string;
  onClick: () => void;
};

export type TFilterNoteProps = {
  text: string;
  variant: EFilterNoteVariant;
  className?: string;
  id?: string;
  /** a way out, shown after the note — e.g. "Switch to standard chart" */
  action?: TFilterNoteAction;
};

export type TUnavailableNoteProps = {
  availability: EFilterAvailability;
};

export type TFilterSectionsProps = {
  /** the filters to show, in order — hidden ones are skipped; all of FILTER_ORDER by default */
  keys?: readonly EFilterKey[];
  values: TFilters;
  /** the view, the dataset being edited, Walter-Lieth — decides what's hidden or disabled */
  context: TFilterAvailabilityContext;
  /** the periods the selected place has data for; null while unknown */
  availablePeriods: readonly TClimatePeriod[] | null;
  /** translation key of the typed year's error, once an Apply found it invalid */
  weatherYearError: string | null;
  cellCount: number | null;
  isApplyBlocked: boolean;
  onChange: TFilterChangeHandler;
  /** several values at once (Compare Periods' pair), normalized together */
  onChangeMany: (values: Partial<TFilters>) => void;
};

/** What every section component gets: the sections' props and its own availability. */
export type TFilterSectionRenderProps = TFilterSectionsProps & {
  availability: EFilterAvailability;
};

/** The section each filter renders as; null for one rendered by another key's section. */
export type TFilterSectionComponents = Record<
  EFilterKey,
  ComponentType<TFilterSectionRenderProps> | null
>;

/** What can be done about a filter being disabled, per reason — e.g. leave Walter-Lieth. */
export type TFilterUnavailableActions = Partial<Record<TFilterUnavailableReason, () => void>>;

/** The label of the way out of each disabling reason that has one. */
export type TFilterUnavailableActionLabels = Partial<
  Record<TFilterUnavailableReason, (t: TTranslate) => string>
>;

export type TComparedPeriodsSectionProps = Pick<
  TFilterSectionRenderProps,
  "values" | "availablePeriods" | "onChange" | "onChangeMany"
> & {
  /** below lg, on the page: full width, no section title for the pair */
  isOnPage?: boolean;
};

export type TPeriodPairProps = {
  periods: TClimatePeriodPair;
  /** the periods the selected place has data for; null while unknown */
  availablePeriods: readonly TClimatePeriod[] | null;
  onChange: (periods: TClimatePeriodPair) => void;
  /** the sidebar's narrow column: A and B stacked when one row doesn't fit */
  isCompact: boolean;
};

export type TYearsEditorProps = {
  value: readonly number[];
  onChange: (periods: number[]) => void;
  /** the sidebar's narrow column: the year field and Add first, the years wrapping below */
  isCompact: boolean;
};

export type TYearInputProps = {
  value?: number | undefined;
  min: number;
  max: number;
  onChange: (year: number) => void;
  placeholder?: string | undefined;
  onEnter?: (() => void) | undefined;
  disabled?: boolean | undefined;
};

export type TFiltersSheetProps = {
  mode: EFiltersSheetMode;
  isOpen: boolean;
  /** single mode's filter; null until a chip was first opened */
  filterKey: EFilterKey | null;
  /** the applied filters — each opening starts from them */
  filters: TFilters;
  context: TFilterAvailabilityContext;
  heatmapBbox: TBbox | null;
  availablePeriods: readonly TClimatePeriod[] | null;
  /** closed without applying — the edits are dropped */
  onClose: () => void;
  onApply: (next: TFilters, mode: EFilterApplyMode) => void;
  /** leaves Walter-Lieth — offered next to its note on variables and months */
  onSwitchToStandardChart: () => void;
};

export type TFiltersSheetFooterProps = {
  onApply: () => void;
  /** too many heat map cells — Apply is disabled, and the footer says why */
  isApplyBlocked: boolean;
  /** shows Reset (to the defaults) when given */
  onReset?: () => void;
};

/** What the sheet's content builders get: its props, the draft, and the translator. */
export type TFiltersSheetContentArgs = {
  props: TFiltersSheetProps;
  filtersDraft: ReturnType<typeof useFiltersDraft>;
  t: TTranslate;
};

/** One mode's sheet: its title, height, footer (none for instant filters) and body. */
export type TFiltersSheetContent = {
  title: string;
  height: EBottomSheetHeight;
  footer?: ReactNode;
  body: ReactNode;
};

export type TCellCountBadgeProps = {
  count: number;
};
