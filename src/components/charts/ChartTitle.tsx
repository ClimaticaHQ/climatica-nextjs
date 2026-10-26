import type { TChartTitleProps } from "./charts.type";
import { DatabaseIcon } from "@/components/svg/DatabaseIcon";
import { CHART_TITLE_CLASSES as C } from "./charts.constant";
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
            <span aria-hidden className={C.SUBTITLE_ICON}>
              <DatabaseIcon />
            </span>
            <span>{subtitleText}</span>
          </span>
        )}
        {showMonthBadge && <MonthBadge selectedMonths={selectedMonths} />}
      </div>
    </div>
  );
}
