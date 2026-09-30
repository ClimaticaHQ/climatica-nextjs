import { Card } from "@/components/Card";
import { MartonneBadge } from "@/components/MartonneBadge";
import { VALUE_DIGITS } from "@/constants";
import { ECardPadding, ECardSize } from "@/enums";
import { useFormatNumber } from "@/hooks";
import { getMartonneBadge } from "@/utils";
import { useTranslations } from "next-intl";
import {
  STATS_BAR_COLUMNS,
  STATS_BAR_CONTAINER_CLASS,
  STATS_BAR_STYLE,
} from "./ClimateStatsBar.constant";
import type { TClimateStatsBarProps } from "./ClimateStatsBar.type";
import { StatCell, StatValue } from "./components";

/** One place's annual stats — the city page (and the heat map's region profile). */
export function ClimateStatsBar({
  meanTemp,
  annualPrecip,
  aridMonths,
  altitude,
  martonneIndex,
}: TClimateStatsBarProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const showAltitude = altitude !== undefined;
  const badge = martonneIndex !== null ? getMartonneBadge(martonneIndex) : null;
  // * every cell reserves the meta row (Martonne class), so the values line up
  const cell = { hasMetaRow: true, cellClassName: STATS_BAR_STYLE.cell };

  return (
    <Card
      size={ECardSize.MD}
      padding={ECardPadding.NONE}
      shouldClip
      className={STATS_BAR_CONTAINER_CLASS}
    >
      <div
        className={`grid grid-cols-2 items-stretch ${STATS_BAR_STYLE.bar} ${STATS_BAR_COLUMNS[showAltitude ? 5 : 4]}`}
      >
        <StatCell {...cell} label={t("chart.meanTemp")}>
          <StatValue
            value={t("units.celsiusValue", {
              value: formatNumber(meanTemp, { digits: VALUE_DIGITS.TEMP }),
            })}
          />
        </StatCell>
        <StatCell {...cell} label={t("chart.annualPrec")}>
          <StatValue value={t("units.mmValue", { value: formatNumber(annualPrecip) })} />
        </StatCell>
        <StatCell {...cell} label={t("chart.aridMonths")}>
          <StatValue value={String(aridMonths)} />
        </StatCell>
        {showAltitude && (
          <StatCell {...cell} label={t("chart.altitude")}>
            <StatValue value={t("units.metersValue", { value: formatNumber(altitude) })} />
          </StatCell>
        )}
        <StatCell
          {...cell}
          label={t("chart.martonneShort")}
          fullLabel={t("chart.martonne")}
          title={t("chart.martonneTooltip")}
          meta={badge && <MartonneBadge badge={badge} />}
        >
          <StatValue value={formatNumber(martonneIndex, { digits: VALUE_DIGITS.MARTONNE })} />
        </StatCell>
      </div>
    </Card>
  );
}
