import { ChartLegend } from "@/components/ChartLegend";
import { SplitPanels, type TSplitPanelRender } from "@/components/SplitPanels";
import { EWalterLiethSeriesId } from "@/enums";
import { useLegendLabels } from "@/hooks";
import { getStandardSplitLegendItems } from "@/utils";
import type { TStandardSplitViewProps } from "./StandardSplitView.type";
import { StandardPanel } from "./components";

/**
 * Standard charts side by side (stacked below `sm`), one per series, on one temperature and
 * one precipitation domain, hover-synced, one legend — the WL split's structure, including
 * one panel expanded across the card.
 */
export function StandardSplitView({
  seriesA,
  seriesB,
  expansion,
  ...shared
}: TStandardSplitViewProps) {
  const panels = { [EWalterLiethSeriesId.A]: seriesA, [EWalterLiethSeriesId.B]: seriesB };
  const legendLabels = useLegendLabels();

  const renderPanel = (id: EWalterLiethSeriesId, { slots }: TSplitPanelRender) => (
    <StandardPanel panel={panels[id]} headerSlots={slots} {...shared} />
  );

  return (
    <SplitPanels
      expansion={expansion}
      labels={{
        [EWalterLiethSeriesId.A]: seriesA.series.label,
        [EWalterLiethSeriesId.B]: seriesB.series.label,
      }}
      // * an incomplete series still gets its panel (a chart with gaps)
      expandable={{ [EWalterLiethSeriesId.A]: true, [EWalterLiethSeriesId.B]: true }}
      renderPanel={renderPanel}
      renderLegend={(shown) => (
        <ChartLegend
          items={getStandardSplitLegendItems({
            labels: legendLabels,
            colorsA: seriesA.colors,
            colorsB: seriesB.colors,
            visible: shared.visible,
            shown,
          })}
        />
      )}
    />
  );
}
