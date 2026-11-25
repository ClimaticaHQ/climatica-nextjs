import { useUnitLabels } from "@/hooks/ui/useUnitLabels";
import type { TChartFeatures, TChartModel, TChartSeriesModel } from "@/types";
import { buildComparisonTable, toWalterLiethSeriesId } from "@/utils";
import { useLocale } from "next-intl";

const toTableSeries = ({ series }: TChartSeriesModel) => ({
  id: toWalterLiethSeriesId(series.id),
  label: series.label,
  data: series.data,
  altitude: series.altitude,
});

export function useComparisonTable(model: TChartModel, features: TChartFeatures) {
  const locale = useLocale();
  const units = useUnitLabels();
  const [first, second] = model.series;
  if (!features.difference || !first?.hasData || !second?.hasData) return null;

  return buildComparisonTable({
    seriesA: toTableSeries(first),
    seriesB: toTableSeries(second),
    minuend: toWalterLiethSeriesId(features.difference.minuendId),
    locale,
    units,
    martonneYear: first.series.year ?? undefined,
  });
}
