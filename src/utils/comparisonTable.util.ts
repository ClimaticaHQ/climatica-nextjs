import { COMPARISON_METRICS, MISSING_VALUE_LABEL } from "@/constants";
import { ENumberSign, EWalterLiethFrost } from "@/enums";
import type {
  TBuildComparisonTableArgs,
  TComparisonMetric,
  TComparisonMetricFormat,
  TComparisonTable,
  TComparisonTableSeries,
  TComparisonTableValue,
  TBuildStatsTableArgs,
  TFormatComparisonValueOptions,
  TStatsTable,
} from "@/types";
import { computeCompareStats } from "./climateComparison.util";
import { getMartonneBadge } from "./martonne.util";
import { meanOf, toWalterLiethMonths, withMonthlyMean } from "./monthlyClimate.util";
import { formatDifference, formatValue as formatDisplayValue } from "./displayFormat.util";
import { getFrostMonths } from "./walterLieth.util";

const withUnit = (text: string, unit: string | null) => (unit ? `${text} ${unit}` : text);

function countFrostMonths(data: TComparisonTableSeries["data"]) {
  const months = toWalterLiethMonths(withMonthlyMean(data));
  const frost = months ? getFrostMonths(months) : null;
  if (!frost || frost.includes(EWalterLiethFrost.UNKNOWN)) return null;
  return frost.filter((state) => state === EWalterLiethFrost.FROST).length;
}

function getMetricValues({
  data,
  altitude,
}: Pick<TComparisonTableSeries, "data" | "altitude">): Record<TComparisonMetric, number | null> {
  const stats = computeCompareStats([...data]);
  return {
    meanTemp: meanOf(withMonthlyMean(data).map((month) => month.tavg)),
    avgTmax: stats.avgTmax,
    avgTmin: stats.avgTmin,
    annualPrec: stats.totalPrec,
    aridMonths: stats.aridMonths,
    frostMonths: countFrostMonths(data),
    altitude,
    martonne: stats.martonneIndex,
  };
}

function formatValue(
  value: number | null,
  { metric, display }: TComparisonMetricFormat,
  { locale, unit }: TFormatComparisonValueOptions,
): TComparisonTableValue {
  if (value === null) return { text: MISSING_VALUE_LABEL };
  const formatted = formatDisplayValue(value, { metric: display, locale, sign: ENumberSign.MINUS });
  const text = withUnit(formatted, unit);
  return metric === "martonne" ? { text, badge: getMartonneBadge(value) } : { text };
}

function formatRowDifference(
  [minuend, subtrahend]: readonly [number | null | undefined, number | null | undefined],
  { display }: TComparisonMetricFormat,
  { locale, unit }: TFormatComparisonValueOptions,
): string | null {
  if (
    minuend === null ||
    minuend === undefined ||
    subtrahend === null ||
    subtrahend === undefined
  ) {
    return null;
  }
  return withUnit(formatDifference({ minuend, subtrahend, metric: display, locale }), unit);
}

export function buildComparisonTable({
  seriesA,
  seriesB,
  minuend,
  locale,
  martonneYear,
  units,
}: TBuildComparisonTableArgs): TComparisonTable {
  const valuesA = getMetricValues(seriesA);
  const valuesB = getMetricValues(seriesB);
  const isAFirst = minuend === seriesA.id;
  const [first, second] = isAFirst ? [valuesA, valuesB] : [valuesB, valuesA];

  return {
    seriesA: { id: seriesA.id, label: seriesA.label },
    seriesB: { id: seriesB.id, label: seriesB.label },
    minuend: isAFirst ? seriesA.label : seriesB.label,
    subtrahend: isAFirst ? seriesB.label : seriesA.label,
    ...(martonneYear !== undefined ? { martonneYear } : {}),
    rows: COMPARISON_METRICS.map((format) => {
      const [x, y] = [first[format.metric], second[format.metric]];
      const unit = format.unit === null ? null : units[format.unit];
      return {
        metric: format.metric,
        a: formatValue(valuesA[format.metric], format, { locale, unit }),
        b: formatValue(valuesB[format.metric], format, { locale, unit }),
        difference: formatRowDifference([x, y], format, { locale, unit }),
      };
    }),
  };
}

export function buildStatsTable({
  series,
  minuendId,
  locale,
  units,
}: TBuildStatsTableArgs): TStatsTable {
  const values = series.map((entry) => (entry.isLoading ? null : getMetricValues(entry)));
  const minuendIndex = series.findIndex(({ id }) => id === minuendId);
  const pairIndexes =
    series.length === 2 && minuendIndex >= 0 ? [minuendIndex, 1 - minuendIndex] : null;
  const [minuend, subtrahend] = pairIndexes?.map((index) => series[index]) ?? [];

  return {
    columns: series.map(({ id, label, isLoading }) => ({ id, label, isLoading })),
    difference:
      minuend && subtrahend ? { minuend: minuend.label, subtrahend: subtrahend.label } : null,
    rows: COMPARISON_METRICS.map((format) => {
      const unit = format.unit === null ? null : units[format.unit];
      const raw = values.map((entry) => entry?.[format.metric] ?? null);
      const [x, y] = pairIndexes?.map((index) => raw[index] ?? null) ?? [null, null];
      return {
        metric: format.metric,
        values: values.map((entry, index) =>
          entry === null ? null : formatValue(raw[index] ?? null, format, { locale, unit }),
        ),
        difference: formatRowDifference([x, y], format, { locale, unit }),
      };
    }),
  };
}
