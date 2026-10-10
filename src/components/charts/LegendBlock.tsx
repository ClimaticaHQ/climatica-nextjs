import { ChartLegend } from "@/components/ChartLegend";
import { useLegendLabels } from "@/hooks/ui/useLegendLabels";
import { useWalterLiethLegendItems } from "@/hooks/ui/useWalterLiethLegendItems";
import type { TChartBlockProps } from "./charts.type";
import { getChartLegendItems } from "./charts.util";

/** The chart's legend, for its chart type and body. */
export function LegendBlock({ context }: TChartBlockProps) {
  const labels = useLegendLabels();
  const walterLieth = useWalterLiethLegendItems();
  return <ChartLegend items={getChartLegendItems(context, labels, walterLieth)} />;
}
