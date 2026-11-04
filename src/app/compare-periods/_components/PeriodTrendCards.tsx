import { StatCard } from "@/components/StatCard";
import { EDisplayMetric, EStatValueSize } from "@/enums";
import { useDisplayFormat } from "@/hooks/ui/useDisplayFormat";
import { displayDifference } from "@/utils/displayFormat.util";
import { useTranslations } from "next-intl";
import { PERIOD_TREND_CARDS_CLASS } from "./ComparePeriods.constant";
import type { TPeriodTrendCardsProps } from "./ComparePeriods.type";

/** Under a climate comparison: how the max temperature and the precipitation changed, B vs A. */
export function PeriodTrendCards({ trend }: TPeriodTrendCardsProps) {
  const t = useTranslations();
  const { formatDifference } = useDisplayFormat();
  if (!trend) return null;

  const { tmax, prec, labelA, labelB } = trend;
  const sub = t("comparePeriods.trend.comparedTo", { a: labelA, b: labelB });
  // * "no change" when the displayed values are equal, as the stats table above shows them
  const change = (pair: typeof tmax, metric: EDisplayMetric, unitKey: string) =>
    displayDifference({ ...pair, metric }) === 0
      ? t("comparePeriods.trend.noChange")
      : t(unitKey, { value: formatDifference({ ...pair, metric }) });

  return (
    <div className={PERIOD_TREND_CARDS_CLASS}>
      <StatCard
        valueSize={EStatValueSize.LG}
        label={t("comparePeriods.trend.tempTitle")}
        value={change(tmax, EDisplayMetric.TEMPERATURE, "units.celsiusValue")}
        sub={sub}
      />
      <StatCard
        valueSize={EStatValueSize.LG}
        label={t("comparePeriods.trend.precipTitle")}
        value={change(prec, EDisplayMetric.PRECIPITATION, "units.mmValue")}
        sub={sub}
      />
    </div>
  );
}
