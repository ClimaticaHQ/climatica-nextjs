import { DATASETS } from "@/constants";
import { EFilterKey } from "@/enums";
import { ComparedPeriodsFilter } from "../ComparedPeriodsFilter";
import { DatasetFilter } from "../DatasetFilter";
import { MonthsFilter } from "../MonthsFilter";
import { PeriodFilter } from "../PeriodFilter";
import { ResolutionFilter } from "../ResolutionFilter";
import { VariablesFilter } from "../VariablesFilter";
import { WeatherPeriodsEditor } from "../WeatherPeriodsEditor";
import type { TFilterSectionRenderers } from "./FilterSections.type";
import {
  getGridSizeOptionStates,
  getVariableOptionStates,
  getVariablesHints,
} from "./FilterSections.util";

// * the section each filter renders as
export const FILTER_SECTION_RENDERERS: TFilterSectionRenderers = {
  [EFilterKey.DATASET]: ({ values, onChange }) => (
    <DatasetFilter
      value={values.dataset}
      onChange={(value) => onChange(EFilterKey.DATASET, value)}
    />
  ),
  [EFilterKey.CLIMATE_PERIOD]: ({ values, availablePeriods, onChange }) => (
    <PeriodFilter
      dataset={DATASETS.CLIMATE}
      value={values.climatePeriod}
      availablePeriods={availablePeriods}
      onChange={(value) => onChange(EFilterKey.CLIMATE_PERIOD, value)}
    />
  ),
  // * Compare Periods' pair — one section for both (B renders nothing); sidebar only, the page
  // * has PeriodSelectors below lg
  [EFilterKey.CLIMATE_PERIOD_A]: ({ values, availablePeriods, onChangeMany }) => (
    <ComparedPeriodsFilter
      periods={values}
      availablePeriods={availablePeriods}
      onChange={onChangeMany}
    />
  ),
  [EFilterKey.CLIMATE_PERIOD_B]: () => null,
  [EFilterKey.WEATHER_YEAR]: ({ values, weatherYearError, onChange }) => (
    <PeriodFilter
      dataset={DATASETS.WEATHER}
      value={values.weatherYear}
      error={weatherYearError}
      onChange={(value) => onChange(EFilterKey.WEATHER_YEAR, value)}
    />
  ),
  [EFilterKey.WEATHER_PERIODS]: ({ values, onChange }) => (
    <WeatherPeriodsEditor
      value={values.weatherPeriods}
      onChange={(value) => onChange(EFilterKey.WEATHER_PERIODS, value)}
      isCompact
    />
  ),
  [EFilterKey.VARIABLES]: ({ values, context, availability, onChange }) => (
    <VariablesFilter
      value={values.variables}
      options={getVariableOptionStates(values, context)}
      availability={availability}
      hints={getVariablesHints(context)}
      onChange={(value) => onChange(EFilterKey.VARIABLES, value)}
    />
  ),
  [EFilterKey.GRID_SIZE]: ({ values, cellCount, isApplyBlocked, onChange }) => (
    <ResolutionFilter
      value={values.gridSize}
      options={getGridSizeOptionStates(values)}
      cellCount={cellCount}
      isApplyBlocked={isApplyBlocked}
      onChange={(value) => onChange(EFilterKey.GRID_SIZE, value)}
    />
  ),
  [EFilterKey.MONTHS]: ({ values, availability, onChange }) => (
    <MonthsFilter
      value={values.months}
      availability={availability}
      onChange={(value) => onChange(EFilterKey.MONTHS, value)}
    />
  ),
};
