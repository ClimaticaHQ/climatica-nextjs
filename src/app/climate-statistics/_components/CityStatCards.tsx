import { StatCard } from "@/components/StatCard";
import { StatCardsSkeleton } from "@/components/UI";
import { MISSING_VALUE_LABEL } from "@/constants";
import { EDataStatus } from "@/enums";
import { useTranslations } from "next-intl";
import { CITY_STAT_CARDS_CLASSES as C, STAT_CARD_FLASH_KEYS } from "./ClimateStatistics.constant";
import type { TCityStatCardsProps } from "./ClimateStatistics.type";

/** The place's values for the month filter, above its chart; their skeleton while loading. */
export function CityStatCards({ state, summary }: TCityStatCardsProps) {
  const t = useTranslations();
  if (state.status === EDataStatus.LOADING) return <StatCardsSkeleton />;
  if (!summary) return null;

  const { stats, isSingleMonth, filteredMonthNames, altitude } = summary;
  const card = { flashKeys: STAT_CARD_FLASH_KEYS };

  return (
    <div className={C.ROOT}>
      <div data-testid="stat-cards" className={C.GRID}>
        <StatCard
          {...card}
          label={t(
            isSingleMonth ? "climateStatistics.stats.tmax" : "climateStatistics.stats.avgTmax",
          )}
          value={stats.avgTmax}
          unit={t("units.celsius")}
        />
        <StatCard
          {...card}
          label={t(
            isSingleMonth ? "climateStatistics.stats.tmin" : "climateStatistics.stats.avgTmin",
          )}
          value={stats.avgTmin}
          unit={t("units.celsius")}
        />
        <StatCard
          {...card}
          label={t("climateStatistics.stats.totalPrec")}
          value={stats.totalPrec}
          unit={isSingleMonth ? t("climateStatistics.stats.mmThisMonth") : t("units.mm")}
        />
        <StatCard
          {...card}
          label={t("climateStatistics.stats.altitude")}
          value={altitude !== null ? String(altitude) : MISSING_VALUE_LABEL}
          {...(altitude !== null ? { unit: t("units.meters") } : {})}
        />
      </div>
      {/* * the line keeps its height when empty, so the filter never moves the chart */}
      <p
        className={C.FILTERED_MONTHS}
        style={{ visibility: filteredMonthNames ? "visible" : "hidden" }}
      >
        {filteredMonthNames
          ? t("climateStatistics.stats.filteredMonths", { months: filteredMonthNames })
          : " "}
      </p>
    </div>
  );
}
