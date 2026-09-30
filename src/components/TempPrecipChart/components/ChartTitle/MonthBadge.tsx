import { useTranslations } from "next-intl";
import { CalendarIcon } from "../../icons";
import type { TMonthBadgeProps } from "../../TempPrecipChart.type";
import { CHART_TITLE_CLASSES as C } from "./ChartTitle.constant";

/** The month filter in the standard single-city chart: one month's name, or how many. */
export function MonthBadge({ selectedMonths }: TMonthBadgeProps) {
  const t = useTranslations();
  const count = selectedMonths?.length ?? 0;
  // * none or all twelve selected = no filter
  if (count === 0 || count >= 12) return null;

  return (
    <span className="flex items-center gap-1 text-[var(--color-month-badge-text)]">
      <CalendarIcon />
      <span className={C.MONTH_BADGE}>
        {count === 1 && selectedMonths
          ? t(`months.${selectedMonths[0]}`)
          : t("chart.selectedMonthsCount", { count })}
      </span>
    </span>
  );
}
