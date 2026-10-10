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
import { formatNumber } from "./numberFormat.util";
import { getFrostMonths } from "./walterLieth.util";

const withUnit = (text: string, unit: string | null) => (unit ? `${text} ${unit}` : text);

/** Frost months by the WL rule (mean min < 0 °C); null when any month's minimum is unknown. */
function countFrostMonths(data: TComparisonTableSeries["data"]) {
  const months = toWalterLiethMonths(withMonthlyMean(data));
  const frost = months ? getFrostMonths(months) : null;
  if (!frost || frost.includes(EWalterLiethFrost.UNKNOWN)) return null;
  return frost.filter((state) => state === EWalterLiethFrost.FROST).length;
}

/** Every row's raw number for one series — null when it can't be computed from the data. */
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
  { metric, digits }: TComparisonMetricFormat,
  { locale, unit }: TFormatComparisonValueOptions,
): TComparisonTableValue {
  if (value === null) return { text: MISSING_VALUE_LABEL };
  // * every value with a real minus sign ("−3,6"), in the locale's decimals
  const text = withUnit(formatNumber(value, { locale, digits, sign: ENumberSign.MINUS }), unit);
  return metric === "martonne" ? { text, badge: getMartonneBadge(value) } : { text };
}

/**
 * The comparison table: every metric for both series and their difference, minuend −
 * subtrahend (B − A for cities, the later period for periods). A missing value reads as "—";
 * its difference is left out. The page and the export draw these rows.
 */
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
        difference:
          x !== null && y !== null
            ? withUnit(
                formatNumber(x - y, { locale, digits: format.digits, sign: ENumberSign.SIGNED }),
                unit,
              )
            : null,
      };
    }),
  };
}

/**
 * The stats table: every metric for each series, a loading series' cells left empty (null), and
 * — for a pair with a minuend — the difference, minuend − the other. The page draws these rows;
 * a pair's export draws buildComparisonTable's.
 */
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
        difference:
          x !== null && x !== undefined && y !== null && y !== undefined
            ? withUnit(
                formatNumber(x - y, { locale, digits: format.digits, sign: ENumberSign.SIGNED }),
                unit,
              )
            : null,
      };
    }),
  };
}
