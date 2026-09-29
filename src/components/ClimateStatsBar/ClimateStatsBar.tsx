import { getMartonneBadge } from "@/utils";
import { useTranslations } from "next-intl";
import {
  STATS_BAR_COLUMNS,
  STATS_BAR_CONTAINER_CLASS,
  STATS_BAR_STYLE,
} from "./ClimateStatsBar.constant";
import type { TClimateStatsBarProps } from "./ClimateStatsBar.type";
import { formatAltitude, formatMartonne } from "./ClimateStatsBar.util";
import { MartonneBadge, StatCell, StatValue } from "./components";

export function ClimateStatsBar({
  meanTemp,
  annualPrecip,
  aridMonths,
  altitude,
  martonneIndex,
  comparison,
  primaryColor,
  deltas,
  isInPanel = false,
}: TClimateStatsBarProps) {
  const t = useTranslations();
  const showAltitude = altitude !== undefined || comparison?.altitude !== undefined;
  const colCount = showAltitude ? 5 : 4;
  const aColor = primaryColor ?? "var(--color-text)";
  const pair = (a: string, b: string | undefined) => ({ a, b, aColor, bColor: comparison?.color });
  const badge = martonneIndex !== null && !comparison ? getMartonneBadge(martonneIndex) : null;
  const style = isInPanel ? STATS_BAR_STYLE.PANEL : STATS_BAR_STYLE.FRAMED;
  // * a single series always has a meta row (Martonne class), so side-by-side bars align
  const cell = { hasMetaRow: !comparison || deltas !== undefined, cellClassName: style.cell };

  return (
    <div className={STATS_BAR_CONTAINER_CLASS}>
      <div
        className={`grid grid-cols-2 items-stretch overflow-hidden ${style.bar} ${STATS_BAR_COLUMNS[colCount]}`}
      >
        <StatCell {...cell} label={t("chart.meanTemp")} meta={deltas?.meanTemp}>
          <StatValue
            {...pair(
              `${meanTemp.toFixed(1)}°C`,
              comparison && `${comparison.meanTemp.toFixed(1)}°C`,
            )}
          />
        </StatCell>
        <StatCell {...cell} label={t("chart.annualPrec")} meta={deltas?.annualPrecip}>
          <StatValue
            {...pair(`${annualPrecip} mm`, comparison && `${comparison.annualPrecip} mm`)}
          />
        </StatCell>
        <StatCell {...cell} label={t("chart.aridMonths")} meta={deltas?.aridMonths}>
          <StatValue {...pair(String(aridMonths), comparison && String(comparison.aridMonths))} />
        </StatCell>
        {showAltitude && (
          <StatCell {...cell} label={t("chart.altitude")}>
            <StatValue
              {...pair(formatAltitude(altitude), comparison && formatAltitude(comparison.altitude))}
            />
          </StatCell>
        )}
        <StatCell
          {...cell}
          label={t("chart.martonneShort")}
          fullLabel={t("chart.martonne")}
          title={t("chart.martonneTooltip")}
          meta={
            <>
              {badge && <MartonneBadge badge={badge} />}
              {deltas?.martonne}
            </>
          }
        >
          <StatValue
            {...pair(
              formatMartonne(martonneIndex),
              comparison && formatMartonne(comparison.martonneIndex),
            )}
          />
        </StatCell>
      </div>
    </div>
  );
}
