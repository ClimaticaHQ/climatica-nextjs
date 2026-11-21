import { StatCard } from "@/components/StatCard";
import { TEXT_PLACEHOLDER_WIDTHS, TextPlaceholder } from "@/components/UI/TextPlaceholder";
import { MISSING_VALUE_LABEL } from "@/constants";
import { EDataStatus } from "@/enums";
import { useTranslations } from "next-intl";
import { CITY_STAT_CARDS_CLASSES as C, STAT_CARD_FLASH_KEYS } from "./ClimateStatistics.constant";
import type { TCityStatCardsProps } from "./ClimateStatistics.type";

/**
 * The place's values for the month filter, above its chart. While they load, the same cards
 * with placeholders for the values, so nothing moves when they land.
 */
export function CityStatCards({ state, summary }: TCityStatCardsProps) {
  const t = useTranslations();
  const isLoading = state.status === EDataStatus.LOADING;
  if (!isLoading && !summary) return null;

  const pending = <TextPlaceholder widthClass={TEXT_PLACEHOLDER_WIDTHS.STAT} />;
  const isSingleMonth = summary?.isSingleMonth ?? false;
  const filteredMonthNames = summary?.filteredMonthNames ?? null;
  const altitude = summary?.altitude ?? null;
  const card = { flashKeys: STAT_CARD_FLASH_KEYS };

  return (
    <div className={C.ROOT}>
      <div data-testid="stat-cards" className={C.GRID}>
        <StatCard
          {...card}
          label={t(
            isSingleMonth ? "climateStatistics.stats.tmax" : "climateStatistics.stats.avgTmax",
          )}
          value={summary ? summary.stats.avgTmax : pending}
          unit={t("units.celsius")}
        />
        <StatCard
          {...card}
          label={t(
            isSingleMonth ? "climateStatistics.stats.tmin" : "climateStatistics.stats.avgTmin",
          )}
          value={summary ? summary.stats.avgTmin : pending}
          unit={t("units.celsius")}
        />
        <StatCard
          {...card}
          label={t("climateStatistics.stats.totalPrec")}
          value={summary ? summary.stats.totalPrec : pending}
          unit={isSingleMonth ? t("climateStatistics.stats.mmThisMonth") : t("units.mm")}
        />
        <StatCard
          {...card}
          label={t("climateStatistics.stats.altitude")}
          value={summary ? (altitude !== null ? String(altitude) : MISSING_VALUE_LABEL) : pending}
          {...(altitude !== null || !summary ? { unit: t("units.meters") } : {})}
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
