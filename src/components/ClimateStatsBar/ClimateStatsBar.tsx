import { Card } from "@/components/Card";
import { MartonneBadge } from "@/components/MartonneBadge";
import { VALUE_DIGITS } from "@/constants";
import { ECardPadding, ECardSize } from "@/enums";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { buildMartonneTooltip, getMartonneBadge } from "@/utils";
import { useTranslations } from "next-intl";
import {
  STATS_BAR_COLUMNS,
  STATS_BAR_CONTAINER_CLASS,
  STATS_BAR_STYLE,
} from "./ClimateStatsBar.constant";
import type { TClimateStatsBarProps } from "./ClimateStatsBar.type";
import { StatCell } from "@/components/UI/StatCell";

/** One place's annual stats: under each chart, and the heat map's regional profile. */
export function ClimateStatsBar({
  meanTemp,
  annualPrecip,
  aridMonths,
  altitude,
  martonneIndex,
  martonneYear,
}: TClimateStatsBarProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  const showAltitude = altitude !== undefined;
  const badge = martonneIndex !== null ? getMartonneBadge(martonneIndex) : null;
  // * a single weather year: the index describes that year alone, and says so
  const martonneLabels =
    martonneYear === undefined
      ? {
          label: t("chart.martonneShort"),
          fullLabel: t("chart.martonne"),
          title: buildMartonneTooltip(t("chart.martonneTooltip"), t),
        }
      : {
          label: t("chart.martonneShortYear", { year: martonneYear }),
          fullLabel: t("chart.martonneYear", { year: martonneYear }),
          title: buildMartonneTooltip(t("chart.martonneTooltipYear", { year: martonneYear }), t),
        };
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
        <StatCell
          {...cell}
          label={t("chart.meanTemp")}
          value={t("units.celsiusValue", {
            value: formatNumber(meanTemp, { digits: VALUE_DIGITS.TEMP }),
          })}
        />
        <StatCell
          {...cell}
          label={t("chart.annualPrec")}
          value={t("units.mmValue", { value: formatNumber(annualPrecip) })}
        />
        <StatCell {...cell} label={t("chart.aridMonths")} value={String(aridMonths)} />
        {showAltitude && (
          <StatCell
            {...cell}
            label={t("chart.altitude")}
            value={t("units.metersValue", { value: formatNumber(altitude) })}
          />
        )}
        <StatCell
          {...cell}
          {...martonneLabels}
          meta={badge && <MartonneBadge badge={badge} />}
          value={formatNumber(martonneIndex, { digits: VALUE_DIGITS.MARTONNE })}
        />
      </div>
    </Card>
  );
}
