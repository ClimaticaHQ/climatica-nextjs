import { MONTHLY_TABLE } from "@/constants";
import { useMonthlyValuesNames } from "@/hooks";
import { buildMonthlyValuesRows } from "@/utils";
import { useLocale, useTranslations } from "next-intl";
import { MONTHLY_VALUES_PALETTE } from "./MonthlyValuesTable.constant";
import type { TMonthlyValuesTableProps } from "./MonthlyValuesTable.type";
import { HorizontalValues, VerticalValues } from "./components";

/**
 * The monthly values under every chart: mean temperature and precipitation, one column per
 * month exactly under the plot's (A above B in overlay). Hovering or focusing a month
 * highlights it in every chart and table of the card. Below `sm`: a vertical table behind a
 * disclosure. The export draws the same rows (buildMonthlyValuesRows).
 */
export function MonthlyValuesTable({ series, isCompact, ...hover }: TMonthlyValuesTableProps) {
  const t = useTranslations();
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

  const variant = { rows, caption, flashKeys: series.map(({ key }) => key), ...hover };

  return (
    <>
      <HorizontalValues isCompact={isCompact} {...variant} />
      <VerticalValues {...variant} />
    </>
  );
}
