import { StatCard } from "@/components/StatCard";
import { EDisplayMetric, EStatValueSize } from "@/enums";
import { useDisplayFormat } from "@/hooks/ui/useDisplayFormat";
import { useMonthName } from "@/hooks/ui/useMonthName";
import { useTranslations } from "next-intl";
import { CITY_DIFFERENCE_CARDS_CLASS } from "./CompareCities.constant";
import type { TDiffStats, TValuePair } from "@/types";
import { displayDifference } from "@/utils/displayFormat.util";
import type { TCityDifferenceCardsProps } from "./CompareCities.type";

export function CityDifferenceCards({ differences }: TCityDifferenceCardsProps) {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const monthName = useMonthName();
  if (!differences) return null;

  const { diff, labelA, labelB } = differences;
  const winner = (side: TDiffStats["warmerCity"]) =>
    side === "tie" ? t("climateComparison.diff.tie") : side === "A" ? labelA : labelB;
  const celsius = (value: number) =>
    t("units.celsiusValue", { value: formatValue(value, { metric: EDisplayMetric.TEMPERATURE }) });
  // * how far apart the two displayed values are, unsigned: the winner names the direction
  const gap = (pair: TValuePair, metric: EDisplayMetric) =>
    formatValue(Math.abs(displayDifference({ ...pair, metric }) ?? 0), { metric });
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
                value: gap(diff.avgTmax, EDisplayMetric.TEMPERATURE),
              })
        }
      />
      <StatCard
        {...card}
        label={t("climateComparison.diff.moreRain")}
        value={winner(diff.moreRainCity)}
        sub={
          diff.moreRainCity === "tie"
            ? t("climateComparison.diff.tieSub")
            : t("climateComparison.diff.byMm", {
                value: gap(diff.totalPrec, EDisplayMetric.PRECIPITATION),
              })
        }
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
