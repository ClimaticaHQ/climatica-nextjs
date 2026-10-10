import { ChartSkeleton, TableSkeleton } from "@/components/UI";
import { EDataStatus } from "@/enums";
import { CHART_SECTION_CLASSES as C, CHART_SECTION_TABLE_SKELETON } from "./charts.constant";
import type { TChartSectionProps } from "./charts.type";

/**
 * A chart page's main content: the export row, the summary (the stats table) and the chart
 * card — or their skeletons while loading. Empty and error messages are the page layout's.
 */
export function ChartSection({
  state,
  toolbar,
  summary,
  hasSummary,
  children,
}: TChartSectionProps) {
  if (state.status === EDataStatus.LOADING) {
    return (
      <div data-testid="climate-chart" className={C.ROOT}>
        <div className={C.TOOLBAR}>
          <div className={C.TOOLBAR_SKELETON} />
        </div>
        <div className={C.CONTENT}>
          {hasSummary && (
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
    <div data-testid="climate-chart" className={C.ROOT}>
      <div className={C.TOOLBAR}>{toolbar}</div>
      <div className={C.CONTENT}>
        {summary}
        {children}
      </div>
    </div>
  );
}
