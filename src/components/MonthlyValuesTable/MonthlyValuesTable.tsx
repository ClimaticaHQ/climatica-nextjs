import { MONTHLY_TABLE } from "@/constants";
import { useMonthlyValuesNames } from "@/hooks";
import { buildMonthlyValuesRows } from "@/utils";
import { ChartScrollContext } from "@/components/charts/chartScroll.context";
import { useLocale, useTranslations } from "next-intl";
import { useContext } from "react";
import { MONTHLY_VALUES_CLASSES, MONTHLY_VALUES_PALETTE } from "./MonthlyValuesTable.constant";
import type { TMonthlyValuesTableProps } from "./MonthlyValuesTable.type";
import { HorizontalValues, VerticalValues } from "./components";

export function MonthlyValuesTable({
  series,
  isCompact,
  markers = [],
  ...hover
}: TMonthlyValuesTableProps) {
  const t = useTranslations();
  const scroll = useContext(ChartScrollContext);
  const locale = useLocale();
  const names = useMonthlyValuesNames();
  const rows = buildMonthlyValuesRows({
    series,
    palette: MONTHLY_VALUES_PALETTE,
    names,
    locale,
  });
  const caption = t("chart.monthlyTableCaption", {
    names: series.map(({ label }) => label).join(MONTHLY_TABLE.NAMES_SEPARATOR),
  });

  const variant = { rows, caption, markers, flashKeys: series.map(({ key }) => key), ...hover };

  if (scroll) return <HorizontalValues isCompact={isCompact} isScrolling {...variant} />;
  return (
    <div className={MONTHLY_VALUES_CLASSES.ROOT}>
      <HorizontalValues isCompact={isCompact} isScrolling={false} {...variant} />
      <VerticalValues {...variant} />
    </div>
  );
}
