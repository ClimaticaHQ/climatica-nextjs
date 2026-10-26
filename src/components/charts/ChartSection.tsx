import { ChartSkeleton, ExportMenu, TableSkeleton } from "@/components/UI";
import { EChartBlock, EDataStatus } from "@/enums";
import { ChartCard } from "./ChartCard";
import { SectionBlocks } from "./ChartBlocks";
import { CHART_SECTION_CLASSES as C, CHART_SECTION_TABLE_SKELETON } from "./charts.constant";
import type { TChartSectionProps } from "./charts.type";

/**
 * A chart page's main content: the export menu, the blocks above the card (the stats table)
 * and the chart card — or their skeletons while loading. Empty and error messages are the page
 * layout's.
 */
export function ChartSection({ chart, scrollRef }: TChartSectionProps) {
  const { state, model, viewState, features, exportMenu, onVisibleChange } = chart;

  if (state.status === EDataStatus.LOADING) {
    return (
      <div data-testid="climate-chart" className={C.ROOT}>
        <div className={C.TOOLBAR}>
          <div className={C.TOOLBAR_SKELETON} />
        </div>
        <div className={C.CONTENT}>
          {!features.hiddenBlocks.includes(EChartBlock.STATS_TABLE) && (
            <TableSkeleton
              rows={CHART_SECTION_TABLE_SKELETON.ROWS}
              cols={CHART_SECTION_TABLE_SKELETON.COLS}
            />
          )}
          <ChartSkeleton />
        </div>
      </div>
    );
  }
  if (state.status !== EDataStatus.READY) return null;

  return (
    <div ref={scrollRef} data-testid="climate-chart" className={C.ROOT}>
      <div className={C.TOOLBAR}>
        <ExportMenu {...exportMenu} />
      </div>
      <div className={C.CONTENT}>
        <SectionBlocks model={model} features={features} />
        <ChartCard
          model={model}
          viewState={viewState}
          features={features}
          onVisibleChange={onVisibleChange}
        />
      </div>
    </div>
  );
}
