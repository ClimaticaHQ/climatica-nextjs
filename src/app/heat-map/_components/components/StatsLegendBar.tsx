import { Card } from "@/components/Card";
import { StatCell } from "@/components/UI/StatCell";
import { DATA_UPDATE_ALL_SERIES, DIFFERENCE_SIGN } from "@/constants";
import { ECardPadding, ECardSize } from "@/enums";
import { useFormatNumber } from "@/hooks/ui/useFormatNumber";
import { interpolateColor } from "@/utils";
import { useTranslations } from "next-intl";
import {
  HEATMAP_VALUE_DIGITS,
  STATS_LEGEND_BAR_CLASSES as C,
  STATS_LEGEND_GRADIENT_STOPS,
} from "../HeatMap.constant";
import type { TStatsLegendBarProps } from "../HeatMap.type";

/**
 * The region's stats — min, max, average, median, spread, cells — and the colour scale's
 * gradient. While the cells load the values wait in their places; a region without data has
 * no bar (the page says why).
 */
export function StatsLegendBar({
  isLoading,
  hasData,
  stats,
  unit,
  scale,
  statSubtitle,
  avgTooltip,
}: TStatsLegendBarProps) {
  const t = useTranslations();
  const formatNumber = useFormatNumber();
  if (!isLoading && !hasData) return null;

  const fmt = (value: number) => `${formatNumber(value, { digits: HEATMAP_VALUE_DIGITS })} ${unit}`;
  const gradient = `linear-gradient(to right, ${Array.from(
    { length: STATS_LEGEND_GRADIENT_STOPS },
    (_, i) =>
      interpolateColor(
        stats.min + (stats.max - stats.min) * (i / (STATS_LEGEND_GRADIENT_STOPS - 1)),
        stats.min,
        stats.max,
        scale,
      ),
  ).join(", ")})`;
  const subtitle = <span className={C.SUBTITLE}>{statSubtitle}</span>;
  const cells = [
    { label: t("heatMap.stats.minValue"), value: fmt(stats.min), meta: subtitle },
    { label: t("heatMap.stats.maxValue"), value: fmt(stats.max), meta: subtitle },
    {
      label: t("heatMap.stats.avgValue"),
      value: fmt(stats.avg),
      meta: subtitle,
      title: avgTooltip,
    },
    { label: t("heatMap.stats.median"), value: fmt(stats.median), meta: subtitle },
    {
      label: t("heatMap.stats.stdDev"),
      value: `${DIFFERENCE_SIGN.NONE}${fmt(stats.stdDev)}`,
      meta: subtitle,
    },
    {
      label: t("heatMap.stats.cellsAnalyzed"),
      value: formatNumber(stats.count, { hasGrouping: true }),
    },
  ];

  return (
    <Card
      size={ECardSize.MD}
      padding={ECardPadding.NONE}
      flashKeys={DATA_UPDATE_ALL_SERIES}
      shouldClip
    >
      <div className={C.FRAME} data-testid="region-stats">
        <div className={C.GRID}>
          {cells.map(({ label, value, meta, title }) => (
            <StatCell
              key={label}
              label={label}
              value={hasData ? value : <span className={C.VALUE_SKELETON} />}
              hasMetaRow
              meta={hasData ? meta : null}
              cellClassName={C.CELL}
              {...(title !== undefined ? { title } : {})}
            />
          ))}
        </div>
      </div>
      {hasData && (
        <div className={C.LEGEND}>
          <div className={C.GRADIENT} style={{ background: gradient }} />
          <div className={C.GRADIENT_LABELS}>
            <span className={C.GRADIENT_LABEL}>{fmt(stats.min)}</span>
            <span className={C.GRADIENT_LABEL}>{fmt(stats.max)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
