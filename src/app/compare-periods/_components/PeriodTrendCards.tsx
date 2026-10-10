import { StatCard } from "@/components/StatCard";
import { VALUE_DIGITS } from "@/constants";
import { ENumberSign, EStatValueSize } from "@/enums";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { useTranslations } from "next-intl";
import { PERIOD_TREND_CARDS_CLASS, PERIOD_TREND_COLORS } from "./ComparePeriods.constant";
import type { TPeriodTrendCardsProps } from "./ComparePeriods.type";

/** Under a climate comparison: how the max temperature and the precipitation changed, B vs A. */
export function PeriodTrendCards({ trend }: TPeriodTrendCardsProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  if (!trend) return null;

  const { tmaxDiff, precDiff, labelA, labelB } = trend;
  const sub = t("comparePeriods.trend.comparedTo", { a: labelA, b: labelB });
  const colorOf = (diff: number) => PERIOD_TREND_COLORS[Math.sign(diff)];

  return (
    <div className={PERIOD_TREND_CARDS_CLASS}>
      <StatCard
        valueSize={EStatValueSize.LG}
        label={t("comparePeriods.trend.tempTitle")}
        value={
          tmaxDiff === 0
            ? t("comparePeriods.trend.noChange")
            : t("units.celsiusValue", {
                value: formatNumber(tmaxDiff, {
                  digits: VALUE_DIGITS.TEMP,
                  sign: ENumberSign.SIGNED,
                }),
              })
        }
        sub={sub}
        valueColor={colorOf(tmaxDiff)}
      />
      <StatCard
        valueSize={EStatValueSize.LG}
        label={t("comparePeriods.trend.precipTitle")}
        value={
          precDiff === 0
            ? t("comparePeriods.trend.noChange")
            : t("units.mmValue", { value: formatNumber(precDiff, { sign: ENumberSign.SIGNED }) })
        }
        sub={sub}
        valueColor={colorOf(precDiff)}
      />
    </div>
  );
}
