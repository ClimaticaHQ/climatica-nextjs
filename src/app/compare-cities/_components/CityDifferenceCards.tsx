import { StatCard } from "@/components/StatCard";
import { VALUE_DIGITS } from "@/constants";
import { EStatValueSize } from "@/enums";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { useMonthName } from "@/hooks/ui/useMonthName";
import { useTranslations } from "next-intl";
import { CITY_DIFFERENCE_CARDS_CLASS, CITY_WINNER_COLORS } from "./CompareCities.constant";
import type { TCityDifferenceCardsProps } from "./CompareCities.type";

/** Under the chart: the warmer and the wetter city, and both cities' hottest and coldest month. */
export function CityDifferenceCards({ differences }: TCityDifferenceCardsProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const monthName = useMonthName();
  if (!differences) return null;

  const { diff, labelA, labelB } = differences;
  const winner = (side: keyof typeof CITY_WINNER_COLORS) =>
    side === "tie" ? t("climateComparison.diff.tie") : side === "A" ? labelA : labelB;
  const celsius = (value: number) =>
    t("units.celsiusValue", { value: formatNumber(value, { digits: VALUE_DIGITS.TEMP }) });
  const monthTemps = (tempA: number, tempB: number) =>
    t("climateComparison.diff.monthTemps", {
      a: labelA,
      tempA: celsius(tempA),
      b: labelB,
      tempB: celsius(tempB),
    });
  const card = { valueSize: EStatValueSize.LG };

  return (
    <div className={CITY_DIFFERENCE_CARDS_CLASS}>
      <StatCard
        {...card}
        label={t("climateComparison.diff.warmerCity")}
        value={winner(diff.warmerCity)}
        sub={
          diff.warmerCity === "tie"
            ? t("climateComparison.diff.tieSub")
            : t("climateComparison.diff.byDegrees", {
                value: formatNumber(diff.tmaxDiff, { digits: VALUE_DIGITS.TEMP }),
              })
        }
        valueColor={CITY_WINNER_COLORS[diff.warmerCity]}
      />
      <StatCard
        {...card}
        label={t("climateComparison.diff.moreRain")}
        value={winner(diff.moreRainCity)}
        sub={
          diff.moreRainCity === "tie"
            ? t("climateComparison.diff.tieSub")
            : t("climateComparison.diff.byMm", { value: formatNumber(diff.precDiff) })
        }
        valueColor={CITY_WINNER_COLORS[diff.moreRainCity]}
      />
      <StatCard
        {...card}
        label={t("climateComparison.diff.hottestMonth")}
        value={monthName(diff.hottestMonthIndex)}
        sub={monthTemps(diff.hottestTempA, diff.hottestTempB)}
      />
      <StatCard
        {...card}
        label={t("climateComparison.diff.coldestMonth")}
        value={monthName(diff.coldestMonthIndex)}
        sub={monthTemps(diff.coldestTempA, diff.coldestTempB)}
      />
    </div>
  );
}
