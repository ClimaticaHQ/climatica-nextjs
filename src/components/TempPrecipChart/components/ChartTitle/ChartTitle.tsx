import type { TChartTitleProps } from "../../TempPrecipChart.type";
import { DatabaseIcon } from "../../icons";
import { CHART_TITLE_CLASSES as C } from "./ChartTitle.constant";
import { ChartTitleNames } from "./ChartTitleNames";
import { MonthBadge } from "./MonthBadge";

/**
 * The chart card's title block, the same for both chart types: the chart type as a muted line,
 * the location(s), then the dataset / period line and — standard single-city — the month badge.
 */
export function ChartTitle({
  names,
  eyebrow = "",
  subtitleText,
  selectedMonths,
  showMonthBadge,
}: TChartTitleProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className={C.EYEBROW}>{eyebrow}</span>
      <ChartTitleNames names={names} />
      <div className={C.SUBTITLE_ROW}>
        {!!subtitleText && (
          <span className={C.SUBTITLE}>
            <DatabaseIcon />
            {subtitleText}
          </span>
        )}
        {showMonthBadge && <MonthBadge selectedMonths={selectedMonths} />}
      </div>
    </div>
  );
}
