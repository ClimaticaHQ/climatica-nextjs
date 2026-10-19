import { LegendSwatch } from "@/components/ChartLegend";
import { TOOLTIP_CLASSES as C, TOOLTIP_FONT_SIZE } from "@/components/charts/charts.constant";
import { TOOLTIP_DIGITS } from "@/constants";
import { useFormatNumber, useWalterLiethLegendItems } from "@/hooks";
import { getSwatchSize, isAridMonth } from "@/utils";
import { useTranslations } from "next-intl";
import type { TWalterLiethTooltipProps } from "../WalterLiethChart.type";

/**
 * One series' hovered month: its values and period in the text colour, each after its legend
 * swatch (temperature and precipitation lines, the humid or arid hatching).
 */
export function WalterLiethTooltip({ active, payload }: TWalterLiethTooltipProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const legendItems = useWalterLiethLegendItems();
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;

  const isArid = isAridMonth(row);
  const size = getSwatchSize(TOOLTIP_FONT_SIZE);
  const swatch = (key: string) => {
    const item = legendItems.find((legendItem) => legendItem.key === key);
    return item && <LegendSwatch swatch={item.swatch} size={size} />;
  };

  return (
    <div className={C.FRAME}>
      <p className={C.TITLE}>{t(`months.${row.monthIndex + 1}`)}</p>
      <p className={C.ROW}>
        {swatch("temp")}
        {t("chart.avgTemperature")}:{" "}
        {t("units.celsiusValue", { value: formatNumber(row.tavg, { digits: TOOLTIP_DIGITS.WL }) })}
      </p>
      <p className={C.ROW}>
        {swatch("prec")}
        {t("chart.precipitation")}:{" "}
        {t("units.mmValue", { value: formatNumber(row.prec, { digits: TOOLTIP_DIGITS.WL }) })}
      </p>
      <p className={`${C.ROW} mt-1`}>
        {swatch(isArid ? "arid" : "humid")}
        {isArid ? t("chart.aridPeriod") : t("chart.humidPeriod")}
      </p>
    </div>
  );
}
