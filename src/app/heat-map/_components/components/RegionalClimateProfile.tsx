import { ClimateStatsBar } from "@/components";
import { useTranslations } from "next-intl";
import type { TRegionalClimateProfileProps } from "../HeatMap.type";

export function RegionalClimateProfile({
  profile,
  isLoading,
  isClimate,
  periodLabel,
  cellCount,
}: TRegionalClimateProfileProps) {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className="h-[52px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)]" />
    );
  }

  if (!profile) return null;

  const subtitle = isClimate
    ? t("heatMap.profile.subtitle", { count: cellCount, period: periodLabel })
    : t("heatMap.profile.subtitleWeather", { count: cellCount, year: periodLabel });

  return (
    <div>
      <p className="mb-2 text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {subtitle}
      </p>
      <ClimateStatsBar
        meanTemp={profile.meanTemp}
        annualPrecip={profile.annualPrecip}
        aridMonths={profile.aridMonths}
        martonneIndex={profile.martonneIndex}
      />
    </div>
  );
}
