import { useTranslations } from "next-intl";
import { WalterLiethChart } from "./WalterLiethChart";
import { WL_COLORS_A, WL_COLORS_B } from "./WalterLiethChart.constant";
import type { TWLCitiesLayoutProps } from "./WalterLiethChart.type";

export function WalterLiethCitiesLayout({
  chartDataA,
  chartDataB,
  labelA,
  labelB,
  scales,
  summaryA,
  summaryB,
}: TWLCitiesLayoutProps) {
  const t = useTranslations();

  const tempDiff = summaryA && summaryB ? summaryA.annualAvgTemp - summaryB.annualAvgTemp : null;
  const aridDiff = summaryA && summaryB ? summaryA.aridCount - summaryB.aridCount : null;

  const tempLabel =
    tempDiff === null
      ? null
      : Math.abs(tempDiff) < 0.05
        ? t("climateComparison.wlCompare.sameTemp")
        : tempDiff > 0
          ? t("climateComparison.wlCompare.warmerBy", {
              label: labelA,
              value: Math.abs(tempDiff).toFixed(1),
            })
          : t("climateComparison.wlCompare.coolerBy", {
              label: labelA,
              value: Math.abs(tempDiff).toFixed(1),
            });

  const aridLabel =
    aridDiff === null
      ? null
      : aridDiff === 0
        ? t("climateComparison.wlCompare.sameArid")
        : aridDiff > 0
          ? t("climateComparison.wlCompare.moreArid", {
              label: labelA,
              value: Math.abs(aridDiff),
            })
          : t("climateComparison.wlCompare.fewerArid", {
              label: labelA,
              value: Math.abs(aridDiff),
            });

  return (
    <div className="flex flex-col gap-4">
      <WalterLiethChart
        chartData={chartDataA}
        scales={scales}
        summary={summaryA}
        colors={WL_COLORS_A}
        title={labelA}
      />
      {tempLabel !== null && aridLabel !== null && (
        <div className="flex flex-wrap justify-center gap-3">
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5 text-[length:var(--font-sm)] font-medium text-[var(--color-text)]">
            {tempLabel}
          </span>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5 text-[length:var(--font-sm)] font-medium text-[var(--color-text)]">
            {aridLabel}
          </span>
        </div>
      )}
      <WalterLiethChart
        chartData={chartDataB}
        scales={scales}
        summary={summaryB}
        colors={WL_COLORS_B}
        title={labelB}
      />
    </div>
  );
}
