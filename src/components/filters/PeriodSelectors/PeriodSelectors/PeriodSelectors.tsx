"use client";

import { DATASETS, LG_MEDIA_QUERY } from "@/constants";
import { EFilterApplyMode } from "@/enums";
import { useCityClimatePeriods } from "@/hooks/filters/useCityClimatePeriods";
import { useFilterNavigation } from "@/hooks/filters/useFilterNavigation";
import { useFilters } from "@/hooks/filters/useFilters";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { WeatherPeriodsEditor } from "../../WeatherPeriodsEditor";
import { PeriodPairSelector } from "../PeriodPairSelector";
import { PERIOD_SELECTORS_CLASS } from "./PeriodSelectors.constant";

/**
 * Compare Periods' own selectors on the page, below lg: the two climate periods, or — with
 * Weather — the compared years. Every change applies at once, replacing the history entry.
 * From lg the sidebar shows the same components as a section (part of its draft).
 */
export function PeriodSelectors() {
  const filters = useFilters();
  const { updateFilters } = useFilterNavigation();
  const availablePeriods = useCityClimatePeriods();
  // * one render per breakpoint: from lg the sidebar's section takes over
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY);
  if (isDesktop) return null;

  return (
    <div className={PERIOD_SELECTORS_CLASS}>
      {filters.dataset === DATASETS.WEATHER ? (
        <WeatherPeriodsEditor
          value={filters.weatherPeriods}
          onChange={(weatherPeriods) => updateFilters({ weatherPeriods }, EFilterApplyMode.QUICK)}
        />
      ) : (
        <PeriodPairSelector
          periods={filters}
          availablePeriods={availablePeriods}
          onChange={(periods) => updateFilters(periods, EFilterApplyMode.QUICK)}
        />
      )}
    </div>
  );
}
