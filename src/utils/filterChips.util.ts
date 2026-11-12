import { ALL_MONTHS, CLIMATE_PERIOD_LABELS, FILTER_UNAVAILABLE_NOTE_KEYS } from "@/constants";
import { EFilterAvailability } from "@/enums";
import type { EFilterKey } from "@/enums";
import type {
  TFilterAvailabilityContext,
  TFilterChip,
  TFilterChipFormatters,
  TFilters,
  TTranslate,
} from "@/types";
import {
  getChipFilterKeys,
  getFilterAvailability,
  isFilterDefault,
  resolveGridSize,
} from "./filters.util";

const formatClimatePeriod = (period: keyof typeof CLIMATE_PERIOD_LABELS) =>
  CLIMATE_PERIOD_LABELS[period];

// * a chip shows the value short: one variable by name, several by their count, a month or a count
const CHIP_FORMATTERS: TFilterChipFormatters = {
  dataset: (dataset, t) => t(`sidebar.datasets.${dataset}`),
  climatePeriod: formatClimatePeriod,
  climatePeriodA: formatClimatePeriod,
  climatePeriodB: formatClimatePeriod,
  weatherYear: (year) => String(year),
  weatherPeriods: (years) => years.join(", "),
  variables: (variables, t) => {
    const [first] = variables;
    if (first === undefined) return "";
    return variables.length === 1
      ? t(`sidebar.variables.${first}`)
      : t("filters.chips.variablesCount", { count: variables.length });
  },
  // * getFilterChips resolves none chosen to the view's grid before formatting
  gridSize: (gridSize, t) =>
    gridSize === null ? "" : t(`cellSizesShort.${gridSize.replace(".", "_")}`),
  months: (months, t) => {
    if (months === ALL_MONTHS) return t("filters.chips.allMonths");
    const [only] = months;
    return months.length === 1 && only !== undefined
      ? t(`months.${only}`)
      : t("filters.chips.monthsCount", { count: months.length });
  },
};

/** A filter's current value, as its chip shows it. */
export function getFilterChipValue<K extends EFilterKey>(key: K, filters: TFilters, t: TTranslate) {
  return CHIP_FORMATTERS[key](filters[key], t);
}

/** The filter's name, as a chip's sheet title and in its accessible label. */
export function getFilterName(key: EFilterKey, t: TTranslate) {
  return t(`filters.names.${key}`);
}

/** "Climate period: 1961–1990" — what a screen reader announces for the chip. */
export function getFilterChipAriaLabel(key: EFilterKey, filters: TFilters, t: TTranslate) {
  return t("filters.chips.value", {
    name: getFilterName(key, t),
    value: getFilterChipValue(key, filters, t),
  });
}

/** The chips a view shows, in FILTER_ORDER — only filters that can be changed there. */
export function getFilterChips(
  filters: TFilters,
  context: TFilterAvailabilityContext,
  t: TTranslate,
): TFilterChip[] {
  // * the chip shows the grid the view loads; whether it's changed is whether one was chosen
  const shown = { ...filters, gridSize: resolveGridSize(filters, context.view) };
  return getChipFilterKeys(context).map((key) => {
    const availability = getFilterAvailability(key, context);
    const reasonKey = FILTER_UNAVAILABLE_NOTE_KEYS[availability];
    const isDisabled = availability !== EFilterAvailability.AVAILABLE;
    return {
      key,
      value: getFilterChipValue(key, shown, t),
      // * a disabled chip is still a button — it opens the explanation — and its name says so:
      // * "Variables: Not available in Walter-Lieth view. Show why"
      ariaLabel:
        isDisabled && reasonKey !== undefined
          ? t("filters.chips.unavailable", { name: getFilterName(key, t), reason: t(reasonKey) })
          : getFilterChipAriaLabel(key, shown, t),
      isChanged: !isDisabled && !isFilterDefault(key, filters[key]),
      isDisabled,
    };
  });
}
