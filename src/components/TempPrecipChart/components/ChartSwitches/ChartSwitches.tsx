import { SegmentedControl, type TSegmentedOption } from "@/components/SegmentedControl";
import { AreaChartIcon, BarChartIcon, OverlayLayoutIcon, SplitLayoutIcon } from "@/components/svg";
import { ECompareLayout } from "@/enums";
import type { TChartMode } from "@/types";
import { useTranslations } from "next-intl";
import type { TChartSwitchesProps } from "../../TempPrecipChart.type";

/**
 * Chart mode (Walter-Lieth / Standard) where WL is offered and, on compare pages, the
 * Split / Overlay layout — for either chart type, so also with Weather data (standard only).
 */
export function ChartSwitches({
  chartMode,
  onChartModeChange,
  canUseWalterLieth,
  layout,
  onLayoutChange,
}: TChartSwitchesProps) {
  const t = useTranslations();
  if (!canUseWalterLieth && layout === undefined) return null;

  const modeOptions: TSegmentedOption<TChartMode>[] = [
    { value: "walter-lieth", label: t("chart.modeWalterLieth"), icon: <AreaChartIcon /> },
    { value: "standard", label: t("chart.modeStandard"), icon: <BarChartIcon /> },
  ];

  return (
    <div className="flex flex-nowrap items-center gap-2">
      {canUseWalterLieth && (
        <SegmentedControl
          label={t("chart.mode")}
          options={modeOptions}
          value={chartMode}
          onChange={onChartModeChange}
        />
      )}
      {layout !== undefined && (
        <SegmentedControl
          label={t("chart.layout")}
          options={[
            {
              value: ECompareLayout.SPLIT,
              label: t("chart.layoutSplit"),
              icon: <SplitLayoutIcon />,
            },
            {
              value: ECompareLayout.OVERLAY,
              label: t("chart.layoutOverlay"),
              icon: <OverlayLayoutIcon />,
            },
          ]}
          value={layout}
          onChange={onLayoutChange}
        />
      )}
    </div>
  );
}
