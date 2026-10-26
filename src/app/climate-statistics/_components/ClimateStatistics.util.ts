import { MISSING_VALUE_LABEL } from "@/constants";
import { meanOf, sumOf } from "@/utils/monthlyClimate.util";
import { formatNumber } from "@/utils/numberFormat.util";
import type {
  TBuildCityStatsSummaryArgs,
  TCityStatsSummary,
  TClimateStats,
  TComputeClimateStatsArgs,
} from "./ClimateStatistics.type";

export function computeClimateStats({
  data,
  months,
  locale,
}: TComputeClimateStatsArgs): TClimateStats {
  const filtered =
    months && months.length > 0 ? data.filter((d) => months.includes(d.month)) : data;

  // * unknown ("—") when no month is selected or any selected month lacks the value
  const format = (value: number | null, digits: number) =>
    filtered.length > 0 ? formatNumber(value, { locale, digits }) : MISSING_VALUE_LABEL;
  const avgTmax = format(meanOf(filtered.map((d) => d.tmax)), 1);
  const avgTmin = format(meanOf(filtered.map((d) => d.tmin)), 1);
  const totalPrec = format(sumOf(filtered.map((d) => d.prec)), 0);

  return { avgTmax, avgTmin, totalPrec };
}

/** The stat cards' values and wording for the month filter. */
export function buildCityStatsSummary({
  data,
  months,
  locale,
  altitude,
  monthNames,
}: TBuildCityStatsSummaryArgs): TCityStatsSummary {
  const isFiltered = months !== null && months.length > 0;
  return {
    stats: computeClimateStats({ data, months, locale }),
    isSingleMonth: isFiltered && months.length === 1,
    filteredMonthNames: isFiltered
      ? [...months]
          .sort((a, b) => a - b)
          .map((month) => monthNames[month - 1])
          .join(", ")
      : null,
    altitude,
  };
}
