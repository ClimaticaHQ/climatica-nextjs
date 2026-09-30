import { COMPARISON_METRICS, MISSING_VALUE_LABEL } from "@/constants";
import { ENumberSign, EWalterLiethFrost } from "@/enums";
import type {
  TBuildComparisonTableArgs,
  TComparisonMetric,
  TComparisonMetricFormat,
  TComparisonTable,
  TComparisonTableSeries,
  TComparisonTableValue,
} from "@/types";
import { computeCompareStats } from "./climateComparison.util";
import { getMartonneBadge } from "./martonne.util";
import { meanOf, toWalterLiethMonths, withMonthlyMean } from "./monthlyClimate.util";
import { formatNumber } from "./numberFormat.util";
import { getFrostMonths } from "./walterLieth.util";

const withUnit = (text: string, unit: string) => (unit ? `${text} ${unit}` : text);

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
}: TComparisonTableSeries): Record<TComparisonMetric, number | null> {
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
  { metric, unit, digits }: TComparisonMetricFormat,
  locale: string,
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
    rows: COMPARISON_METRICS.map((format) => {
      const [x, y] = [first[format.metric], second[format.metric]];
      return {
        metric: format.metric,
        a: formatValue(valuesA[format.metric], format, locale),
        b: formatValue(valuesB[format.metric], format, locale),
        difference:
          x !== null && y !== null
            ? withUnit(
                formatNumber(x - y, { locale, digits: format.digits, sign: ENumberSign.SIGNED }),
                format.unit,
              )
            : null,
      };
    }),
  };
}
