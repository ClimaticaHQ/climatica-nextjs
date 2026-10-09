import type { TClimatePeriod } from "@/constants";
import type { EFilterAvailability, EFilterKey } from "@/enums";
import type { TFilterAvailabilityContext, TFilterChangeHandler, TFilters } from "@/types";
import type { ReactNode } from "react";

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

export type TFilterSectionRenderProps = TFilterSectionsProps & {
  availability: EFilterAvailability;
};

export type TFilterSectionRenderers = Record<
  EFilterKey,
  (props: TFilterSectionRenderProps) => ReactNode
>;
