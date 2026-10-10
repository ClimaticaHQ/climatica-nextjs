import { EDataStatus } from "@/enums";
import { useUnitLabels } from "@/hooks/ui/useUnitLabels";
import type { TChartFeatures, TChartModel } from "@/types";
import { buildStatsTable } from "@/utils";
import { useLocale } from "next-intl";

/**
 * The stats table above the chart: every metric for each series (a loading one's cells wait),
 * and — with the page's difference feature — the pair's difference from its minuend.
 */
export function useStatsTable(model: TChartModel, features: TChartFeatures) {
  const locale = useLocale();
  const units = useUnitLabels();

  return buildStatsTable({
    series: model.series.map(({ series }) => ({
      id: series.id,
      label: series.label,
      data: series.data,
      altitude: series.altitude,
      isLoading: series.state.status === EDataStatus.LOADING,
    })),
    minuendId: features.difference?.minuendId ?? null,
    locale,
    units,
  });
}
