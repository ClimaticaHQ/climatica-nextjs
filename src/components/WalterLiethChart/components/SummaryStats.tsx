import { getMartonneBadge } from "@/utils/martonne.util";
import { useTranslations } from "next-intl";
import type { TSummaryStatsProps } from "../WalterLiethChart.type";

const BORDER_RIGHT = "0.5px solid var(--color-border)";

export function SummaryStats({ summary, altitude }: TSummaryStatsProps) {
  const t = useTranslations();
  const badge = getMartonneBadge(summary.martonne);
  const martonneDisplay = summary.martonne !== null ? summary.martonne.toFixed(1) : "—";

  return (
    <div className="mb-3 flex flex-wrap items-stretch">
      <div className="flex flex-col py-2 pr-4" style={{ borderRight: BORDER_RIGHT }}>
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          {t("chart.meanTemp")}
        </span>
        <span className="text-[16px] font-medium text-[var(--color-text)]">
          {summary.annualAvgTemp.toFixed(1)}°C
        </span>
      </div>

      <div className="flex flex-col px-4 py-2" style={{ borderRight: BORDER_RIGHT }}>
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          {t("chart.annualPrec")}
        </span>
        <span className="text-[16px] font-medium text-[var(--color-text)]">
          {summary.totalPrec} mm
        </span>
      </div>

      <div className="flex flex-col px-4 py-2" style={{ borderRight: BORDER_RIGHT }}>
        <span className="text-[11px] text-[var(--color-text-secondary)]">
          {t("chart.aridMonths")}
        </span>
        <span className="text-[16px] font-medium text-[var(--color-text)]">
          {summary.aridCount}
        </span>
      </div>

      {altitude !== undefined && (
        <div className="flex flex-col px-4 py-2" style={{ borderRight: BORDER_RIGHT }}>
          <span className="text-[11px] text-[var(--color-text-secondary)]">
            {t("chart.altitude")}
          </span>
          <span className="text-[16px] font-medium text-[var(--color-text)]">{altitude} m</span>
        </div>
      )}

      <div
        className="flex flex-col px-4 py-2 rounded-[var(--radius-md)]"
        style={badge ? { backgroundColor: badge.bg } : {}}
        title={t("chart.martonneTooltip")}
      >
        <span
          className="text-[11px]"
          style={{ color: badge ? badge.color : "var(--color-text-secondary)" }}
        >
          {t("chart.martonne")}
        </span>
        <span
          className="text-[16px] font-medium"
          style={{ color: badge ? badge.color : "var(--color-text)", cursor: "help" }}
        >
          {martonneDisplay}
        </span>
        {badge && (
          <span className="text-[10px]" style={{ color: badge.color }}>
            {t(badge.labelKey)}
          </span>
        )}
      </div>
    </div>
  );
}
