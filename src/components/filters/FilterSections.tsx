"use client";

import { FILTER_ORDER } from "@/constants";
import { EFilterAvailability, EFilterKey } from "@/enums";
import { getFilterAvailability } from "@/utils/filters.util";
import type { TFilterSectionComponents, TFilterSectionsProps } from "./filters.type";
import { ComparedPeriodsSection } from "./sections/ComparedPeriods";
import { DatasetFilter } from "./sections/DatasetFilter";
import { MonthsFilter } from "./sections/MonthsFilter";
import { PeriodFilter } from "./sections/PeriodFilter";
import { ResolutionFilter } from "./sections/ResolutionFilter";
import { VariablesFilter } from "./sections/VariablesFilter";

// * each filter's section; Period B is part of Period A's section (the pair is one control).
// * Kept with its renderers, not in filters.constant.ts: importing a filters constant mustn't
// * pull in every section and the page hooks behind them
export const FILTER_SECTION_COMPONENTS = {
  [EFilterKey.DATASET]: DatasetFilter,
  [EFilterKey.CLIMATE_PERIOD]: PeriodFilter,
  [EFilterKey.CLIMATE_PERIOD_A]: ComparedPeriodsSection,
  [EFilterKey.CLIMATE_PERIOD_B]: null,
  [EFilterKey.WEATHER_YEAR]: PeriodFilter,
  [EFilterKey.WEATHER_PERIODS]: ComparedPeriodsSection,
  [EFilterKey.VARIABLES]: VariablesFilter,
  [EFilterKey.GRID_SIZE]: ResolutionFilter,
  [EFilterKey.MONTHS]: MonthsFilter,
} satisfies TFilterSectionComponents;

/**
 * Every filter section the context shows, in FILTER_ORDER — controlled: values in, changes
 * out. Where they're rendered, and when changes apply, is the caller's.
 */
export function FilterSections(props: TFilterSectionsProps) {
  return (props.keys ?? FILTER_ORDER).map((key) => {
    const availability = getFilterAvailability(key, props.context);
    const Section = FILTER_SECTION_COMPONENTS[key];
    if (availability === EFilterAvailability.HIDDEN || Section === null) return null;
    return <Section key={key} {...props} availability={availability} />;
  });
}
