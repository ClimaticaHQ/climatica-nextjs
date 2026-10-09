import { CELL_SIZES, VARIABLES_HINT_RULES } from "@/constants";
import type { TFilterAvailabilityContext, TFilters } from "@/types";
import {
  getVariableOptions,
  isGridSizeOffered,
  isVariableOptionDisabled,
} from "@/utils/filters.util";

export function getVariableOptionStates(values: TFilters, { view }: TFilterAvailabilityContext) {
  const context = { view, dataset: values.dataset, climatePeriod: values.climatePeriod };
  return getVariableOptions(values.dataset).map((value) => ({
    value,
    isDisabled: isVariableOptionDisabled(value, context),
  }));
}

export function getGridSizeOptionStates(values: TFilters) {
  return Object.values(CELL_SIZES).map((value) => ({
    value,
    isDisabled: !isGridSizeOffered(value, values),
  }));
}

export function getVariablesHints(context: TFilterAvailabilityContext) {
  return VARIABLES_HINT_RULES.filter(({ isShown }) => isShown(context)).map(({ hint }) => hint);
}
