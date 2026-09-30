import { ChartLegend } from "@/components/ChartLegend";
import { Card } from "@/components/Card";
import { SplitPanels, type TSplitPanelRender } from "@/components/SplitPanels";
import { WalterLiethChart } from "@/components/WalterLiethChart";
import { WalterLiethIncompleteNotice } from "@/components/WalterLiethChart/components";
import { SPLIT_PANEL_CARD_CLASS } from "@/constants";
import { ECardPadding, ECardSize, EWalterLiethSeriesId } from "@/enums";
import { useWalterLiethLegendItems } from "@/hooks";
import { isCompleteSeries } from "@/utils";
import type { TSplitViewProps } from "../WalterLiethComparison.type";

/**
 * Two diagrams side by side (stacked below `sm`) on one domain, hover-synced, one legend —
 * or one of them expanded across the card, on the same domain.
 * Each sits in a panel Card spanning the pair's two rows (header, plot), so the plots line up.
 */
export function SplitView({
  seriesA,
  seriesB,
  domain,
  syncId,
  expansion,
  activeMonth,
}: TSplitViewProps) {
  const legendItems = useWalterLiethLegendItems();
  const series = { [EWalterLiethSeriesId.A]: seriesA, [EWalterLiethSeriesId.B]: seriesB };

  const renderPanel = (id: EWalterLiethSeriesId, { slots }: TSplitPanelRender) => {
    const panel = series[id];
    return isCompleteSeries(panel) ? (
      <Card
        size={ECardSize.SM}
        padding={ECardPadding.PANEL}
        flashKeys={[panel.id]}
        data-panel-series={panel.id}
        className={SPLIT_PANEL_CARD_CLASS}
      >
        <WalterLiethChart
          series={panel}
          domain={domain}
          syncId={syncId}
          isCompact
          isPanel
          showLegend={false}
          headerSlots={slots}
          activeMonthIndex={activeMonth.activeMonthIndex}
          onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
        />
      </Card>
    ) : (
      <div className="sm:row-span-3">
        <WalterLiethIncompleteNotice label={panel.label} />
      </div>
    );
  };

  return (
    <SplitPanels
      expansion={expansion}
      labels={{ [EWalterLiethSeriesId.A]: seriesA.label, [EWalterLiethSeriesId.B]: seriesB.label }}
      expandable={{
        [EWalterLiethSeriesId.A]: isCompleteSeries(seriesA),
        [EWalterLiethSeriesId.B]: isCompleteSeries(seriesB),
      }}
      renderPanel={renderPanel}
      renderLegend={() => <ChartLegend items={legendItems} />}
    />
  );
}
