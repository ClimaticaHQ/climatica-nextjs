import { StandardClimateChart } from "@/components/TempPrecipChart/charts";
import { WalterLiethChart } from "@/components/WalterLiethChart";
import { WalterLiethIncompleteNotice } from "@/components/WalterLiethChart/components";
import { isCompleteSeries } from "@/utils";
import { ChartBlocks } from "./ChartBlocks";
import { BLOCK_PLACEMENTS } from "./charts.constant";
import type { TChartBodyProps } from "./charts.type";
import { getBlockContext } from "./charts.util";

/** One series, one chart: its blocks under it. */
export function SingleBody(props: TChartBodyProps) {
  const { model, viewState, features, visible, activeMonth } = props;
  const [entry] = model.series;
  if (entry === undefined) return null;

  const { series, walterLieth } = entry;
  const footer = (
    <ChartBlocks
      context={getBlockContext(props, { entries: [entry], isCompact: false, shownPanel: null })}
      placements={BLOCK_PLACEMENTS.ONE_PANEL}
      hiddenBlocks={features.hiddenBlocks}
    />
  );

  if (viewState.mode === "walter-lieth") {
    return isCompleteSeries(walterLieth) ? (
      <WalterLiethChart
        series={walterLieth}
        domain={model.domain}
        activeMonthIndex={activeMonth.activeMonthIndex}
        onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
        footer={footer}
      />
    ) : (
      <WalterLiethIncompleteNotice label={walterLieth.label} />
    );
  }

  const months = viewState.selectedMonths;
  return (
    <StandardClimateChart
      name={series.label}
      chartData={entry.chartData}
      aridity={entry.aridity}
      summary={entry.summary}
      martonneYear={series.year ?? undefined}
      scales={model.scales}
      rightMax={model.rightMax}
      visible={visible}
      activeMonthIndex={activeMonth.activeMonthIndex}
      onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      {...(months !== null && months.length > 0 ? { selectedMonths: months } : {})}
      {...(series.altitude !== null ? { altitude: series.altitude } : {})}
      footer={footer}
    />
  );
}
