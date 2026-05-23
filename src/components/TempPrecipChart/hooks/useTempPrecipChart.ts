import { computeAridityPeriods, getWalterLiethScales } from "@/utils";
import { useMemo } from "react";
import type { TMonthlyTemperatureWithAvg, TTempPrecipChartProps } from "../TempPrecipChart.type";
import { buildCompareData, buildMultiPeriodChartData, computeChartSummary } from "../utils";

export function useTempPrecipChart({ data, dataA, dataB, multiPeriodData }: TTempPrecipChartProps) {
  const isCompare = dataA !== undefined;
  const isMultiPeriod = multiPeriodData !== undefined && multiPeriodData.length > 0;

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
    () => (data ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 })),
    [data],
  );

  const chartData = useMemo<Record<string, unknown>[]>(() => {
    if (isMultiPeriod) return buildMultiPeriodChartData(multiPeriodData);
    if (isCompare) return buildCompareData(dataA ?? [], dataB ?? []);
    return chartDataSingle;
  }, [chartDataSingle, dataA, dataB, isCompare, isMultiPeriod, multiPeriodData]);

  const summary = useMemo(
    () => (aridity && data ? computeChartSummary(data, aridity) : null),
    [aridity, data],
  );

  const chartDataA = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => (isCompare ? (dataA ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 })) : []),
    [dataA, isCompare],
  );

  const chartDataB = useMemo<TMonthlyTemperatureWithAvg[]>(
    () => (isCompare ? (dataB ?? []).map((d) => ({ ...d, tavg: (d.tmax + d.tmin) / 2 })) : []),
    [dataB, isCompare],
  );

  const summaryA = useMemo(
    () => (aridityA && dataA ? computeChartSummary(dataA, aridityA) : null),
    [aridityA, dataA],
  );

  const summaryB = useMemo(
    () => (aridityB && dataB ? computeChartSummary(dataB, aridityB) : null),
    [aridityB, dataB],
  );

  const rightMax = useMemo(() => {
    let precValues: number[];
    if (isMultiPeriod) {
      precValues = multiPeriodData.flatMap((p) => p.rows.map((r) => r.prec));
    } else if (isCompare) {
      precValues = [...(dataA ?? []), ...(dataB ?? [])].map((d) => d.prec);
    } else {
      precValues = (data ?? []).map((d) => d.prec);
    }
    const max = precValues.length ? Math.max(...precValues) : 0;
    return Math.ceil(max / 10) * 10 || 100;
  }, [data, dataA, dataB, isCompare, isMultiPeriod, multiPeriodData]);

  return {
    isCompare,
    isMultiPeriod,
    hasData,
    aridity,
    aridityA,
    scales,
    chartData,
    chartDataSingle,
    chartDataA,
    chartDataB,
    summary,
    summaryA,
    summaryB,
    rightMax,
  };
}
