"use client";

import { SegmentedControl, type TSegmentedOption } from "@/components/SegmentedControl";
import { AreaChartIcon, BarChartIcon } from "@/components/svg";
import { useChartModeUrl } from "@/hooks/url/useChartModeUrl";
import type { TChartMode } from "@/types";
import { useTranslations } from "next-intl";
import type { TChartModeSwitchProps } from "./ChartModeSwitch.type";

/** Walter-Lieth / Standard — writes the `chart` param; the page follows it. */
export function ChartModeSwitch({ value }: TChartModeSwitchProps) {
  const t = useTranslations();
  const { setChartMode } = useChartModeUrl();

  const options: TSegmentedOption<TChartMode>[] = [
    { value: "walter-lieth", label: t("chart.modeWalterLieth"), icon: <AreaChartIcon /> },
    { value: "standard", label: t("chart.modeStandard"), icon: <BarChartIcon /> },
  ];

  return (
    <SegmentedControl
      label={t("chart.mode")}
      options={options}
      value={value}
      onChange={setChartMode}
    />
  );
}
