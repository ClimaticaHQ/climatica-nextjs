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
import { getChipFilterKeys, getFilterAvailability, isFilterDefault } from "./filters.util";

const formatClimatePeriod = (period: keyof typeof CLIMATE_PERIOD_LABELS) =>
  CLIMATE_PERIOD_LABELS[period];

// * a chip shows the value short: the first variable and how many more, a month or a count
const CHIP_FORMATTERS: TFilterChipFormatters = {
  dataset: (dataset, t) => t(`sidebar.datasets.${dataset}`),
  climatePeriod: formatClimatePeriod,
  climatePeriodA: formatClimatePeriod,
  climatePeriodB: formatClimatePeriod,
  weatherYear: (year) => String(year),
  weatherPeriods: (years) => years.join(", "),
  variables: ([first, ...rest], t) => {
    const label = first === undefined ? "" : t(`sidebar.variables.${first}`);
    return rest.length === 0
      ? label
      : t("filters.chips.moreVariables", { label, count: rest.length });
  },
  gridSize: (gridSize, t) => t(`cellSizesShort.${gridSize.replace(".", "_")}`),
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
  return getChipFilterKeys(context).map((key) => {
    const availability = getFilterAvailability(key, context);
    const reasonKey = FILTER_UNAVAILABLE_NOTE_KEYS[availability];
    const isDisabled = availability !== EFilterAvailability.AVAILABLE;
    return {
      key,
      value: getFilterChipValue(key, filters, t),
      // * a disabled chip says why instead of its value: "Variables: Not available in …"
      ariaLabel:
        isDisabled && reasonKey !== undefined
          ? t("filters.chips.value", { name: getFilterName(key, t), value: t(reasonKey) })
          : getFilterChipAriaLabel(key, filters, t),
      isChanged: !isDisabled && !isFilterDefault(key, filters[key]),
      isDisabled,
    };
  });
}
