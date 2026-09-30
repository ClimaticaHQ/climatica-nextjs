import { TMonthlyTemperatureWithAvg } from "@/types";
import {
  computeAridityPeriods,
  getWalterLiethScales,
  summarizeMonths,
  withMonthlyMean,
} from "@/utils";
import { useMemo, useState } from "react";
import type { TTempPrecipChartProps } from "../TempPrecipChart.type";
import { buildCompareData, buildMultiPeriodChartData } from "../utils";

export function useTempPrecipChart({ data, dataA, dataB, multiPeriodData }: TTempPrecipChartProps) {
  const isCompare = dataA !== undefined;
  const isMultiPeriod = multiPeriodData !== undefined && multiPeriodData.length > 0;
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);

  const hasData = useMemo(
    () =>
      isMultiPeriod
        ? multiPeriodData.some((p) => p.rows.length > 0)
        : isCompare
          ? (dataA?.length ?? 0) > 0 || (dataB?.length ?? 0) > 0
          : (data?.length ?? 0) > 0,
    [data, dataA, dataB, isCompare, isMultiPeriod, multiPeriodData],
  );

  const aridity = useMemo(
    () => (!isCompare && !isMultiPeriod && data?.length ? computeAridityPeriods(data) : null),
    [data, isCompare, isMultiPeriod],
  );

  const aridityA = useMemo(
    () => (isCompare && dataA?.length ? computeAridityPeriods(dataA) : null),
    [dataA, isCompare],
  );

  const aridityB = useMemo(
    () => (isCompare && dataB?.length ? computeAridityPeriods(dataB) : null),
    [dataB, isCompare],
  );

  const scalesData = useMemo(() => {
    if (isMultiPeriod) return multiPeriodData.flatMap((p) => p.rows);
    if (isCompare) return [...(dataA ?? []), ...(dataB ?? [])];
    return data ?? [];
  }, [data, dataA, dataB, isCompare, isMultiPeriod, multiPeriodData]);

  const scales = useMemo(
    () => (scalesData.length ? getWalterLiethScales(scalesData) : null),
    [scalesData],
  );

  const chartDataSingle = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => withMonthlyMean(data ?? []),
    [data],
  );

  const chartData = useMemo<Record<string, unknown>[]>(() => {
    if (isMultiPeriod) return buildMultiPeriodChartData(multiPeriodData);
    if (isCompare) return buildCompareData(dataA ?? [], dataB ?? []);
    return chartDataSingle;
  }, [chartDataSingle, dataA, dataB, isCompare, isMultiPeriod, multiPeriodData]);

  // * summaries need every month — with a gap they're unknown (null), never computed over 0s
  const summary = useMemo(() => summarizeMonths(aridity), [aridity]);

  const chartDataA = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => (isCompare ? withMonthlyMean(dataA ?? []) : []),
    [dataA, isCompare],
  );

  const chartDataB = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => (isCompare ? withMonthlyMean(dataB ?? []) : []),
    [dataB, isCompare],
  );

  const summaryA = useMemo(() => summarizeMonths(aridityA), [aridityA]);

  const summaryB = useMemo(() => summarizeMonths(aridityB), [aridityB]);

  const rightMax = useMemo(() => {
    let precValues: (number | null)[];
    if (isMultiPeriod) {
      precValues = multiPeriodData.flatMap((p) => p.rows.map((r) => r.prec));
    } else if (isCompare) {
      precValues = [...(dataA ?? []), ...(dataB ?? [])].map((d) => d.prec);
    } else {
      precValues = (data ?? []).map((d) => d.prec);
    }
    const present = precValues.filter((value): value is number => value !== null);
    const max = present.length ? Math.max(...present) : 0;
    return Math.ceil(max / 10) * 10 || 100;
  }, [data, dataA, dataB, isCompare, isMultiPeriod, multiPeriodData]);

  return {
    isCompare,
    isMultiPeriod,
    hasData,
    aridity,
    aridityA,
    aridityB,
    scales,
    chartData,
    chartDataSingle,
    chartDataA,
    chartDataB,
    summary,
    summaryA,
    summaryB,
    rightMax,
    activeMonthIndex,
    setActiveMonthIndex,
  };
}
