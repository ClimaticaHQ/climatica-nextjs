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
  action?: TFilterNoteAction;
};

export type TUnavailableNoteProps = {
  availability: EFilterAvailability;
};

export type TFilterSectionsProps = {
  keys?: readonly EFilterKey[];
  values: TFilters;
  context: TFilterAvailabilityContext;
  availablePeriods: readonly TClimatePeriod[] | null;
  weatherYearError: string | null;
  cellCount: number | null;
  isApplyBlocked: boolean;
  onChange: TFilterChangeHandler;
  onChangeMany: (values: Partial<TFilters>) => void;
};

export type TFilterSectionRenderProps = TFilterSectionsProps & {
  availability: EFilterAvailability;
};

export type TFilterSectionComponents = Record<
  EFilterKey,
  ComponentType<TFilterSectionRenderProps> | null
>;

export type TFilterUnavailableActions = Partial<Record<TFilterUnavailableReason, () => void>>;

export type TFilterUnavailableActionLabels = Partial<
  Record<TFilterUnavailableReason, (t: TTranslate) => string>
>;

export type TComparedPeriodsSectionProps = Pick<
  TFilterSectionRenderProps,
  "values" | "availablePeriods" | "onChange" | "onChangeMany"
> & {
  isOnPage?: boolean;
};

export type TPeriodPairProps = {
  periods: TClimatePeriodPair;
  availablePeriods: readonly TClimatePeriod[] | null;
  onChange: (periods: TClimatePeriodPair) => void;
  isCompact: boolean;
  testIdPrefix: string;
};

export type TYearsEditorProps = {
  value: readonly number[];
  onChange: (periods: number[]) => void;
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
  filterKey: EFilterKey | null;
  filters: TFilters;
  context: TFilterAvailabilityContext;
  heatmapBbox: TBbox | null;
  availablePeriods: readonly TClimatePeriod[] | null;
  onClose: () => void;
  onApply: (next: TFilters, mode: EFilterApplyMode) => void;
  onSwitchToStandardChart: () => void;
};

export type TFiltersSheetFooterProps = {
  onApply: () => void;
  isApplyBlocked: boolean;
  onReset?: () => void;
};

export type TFiltersSheetContentArgs = {
  props: TFiltersSheetProps;
  filtersDraft: ReturnType<typeof useFiltersDraft>;
  t: TTranslate;
};

export type TFiltersSheetContent = {
  title: string;
  height: EBottomSheetHeight;
  footer?: ReactNode;
  body: ReactNode;
};

export type TCellCountBadgeProps = {
  count: number;
};
