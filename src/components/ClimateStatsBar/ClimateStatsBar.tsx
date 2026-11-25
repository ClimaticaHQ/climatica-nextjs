import { Card } from "@/components/Card";
import { MartonneBadge } from "@/components/MartonneBadge";
import { EBadgeSize, ECardPadding, ECardSize, EDisplayMetric, EStatsBarItem } from "@/enums";
import { PENDING_MARTONNE_CLASS } from "@/constants";
import { Badge } from "@/components/UI/Badge";
import { useDisplayFormat } from "@/hooks/ui/useDisplayFormat";
import { buildMartonneTooltip, getMartonneBadge } from "@/utils";
import { useTranslations } from "next-intl";
import {
  STATS_BAR_COLUMNS,
  STATS_BAR_CONTAINER_CLASS,
  STATS_BAR_STYLE,
} from "./ClimateStatsBar.constant";
import type { TClimateStatsBarProps } from "./ClimateStatsBar.type";
import { StatCell } from "@/components/UI/StatCell";
import { TEXT_PLACEHOLDER_WIDTHS, TextPlaceholder } from "@/components/UI/TextPlaceholder";

export function ClimateStatsBar({
  meanTemp,
  annualPrecip,
  aridMonths,
  altitude,
  martonneIndex,
  martonneYear,
  markers = {},
  isPending = false,
}: TClimateStatsBarProps) {
  const t = useTranslations();
  const { formatValue } = useDisplayFormat();
  const showAltitude = altitude !== undefined || isPending;
  const badge = martonneIndex !== null && !isPending ? getMartonneBadge(martonneIndex) : null;
  const pending = <TextPlaceholder widthClass={TEXT_PLACEHOLDER_WIDTHS.STAT} />;
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
          marker={markers[EStatsBarItem.MEAN_TEMP]}
          label={t("chart.meanTemp")}
          value={
            isPending
              ? pending
              : t("units.celsiusValue", {
                  value: formatValue(meanTemp, { metric: EDisplayMetric.TEMPERATURE }),
                })
          }
        />
        <StatCell
          {...cell}
          marker={markers[EStatsBarItem.ANNUAL_PRECIP]}
          label={t("chart.annualPrec")}
          value={
            isPending
              ? pending
              : t("units.mmValue", {
                  value: formatValue(annualPrecip, { metric: EDisplayMetric.PRECIPITATION }),
                })
          }
        />
        <StatCell
          {...cell}
          marker={markers[EStatsBarItem.ARID_MONTHS]}
          label={t("chart.aridMonths")}
          value={
            isPending ? pending : formatValue(aridMonths, { metric: EDisplayMetric.MONTH_COUNT })
          }
        />
        {showAltitude && (
          <StatCell
            {...cell}
            marker={markers[EStatsBarItem.ALTITUDE]}
            label={t("chart.altitude")}
            value={
              isPending
                ? pending
                : t("units.metersValue", {
                    value: formatValue(altitude, { metric: EDisplayMetric.ELEVATION }),
                  })
            }
          />
        )}
        <StatCell
          {...cell}
          marker={markers[EStatsBarItem.MARTONNE]}
          {...martonneLabels}
          meta={
            badge ? (
              <MartonneBadge badge={badge} />
            ) : (
              isPending && (
                <Badge tone={PENDING_MARTONNE_CLASS.tone} size={EBadgeSize.SM} isPending>
                  {t(PENDING_MARTONNE_CLASS.labelKey)}
                </Badge>
              )
            )
          }
          value={
            isPending ? pending : formatValue(martonneIndex, { metric: EDisplayMetric.MARTONNE })
          }
        />
      </div>
    </Card>
  );
}
