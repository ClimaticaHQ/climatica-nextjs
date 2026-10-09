import { ChartModeSwitch } from "@/components/ChartModeSwitch";
import { SegmentedControl } from "@/components/SegmentedControl";
import { OverlayLayoutIcon, SplitLayoutIcon } from "@/components/svg";
import { ECompareLayout } from "@/enums";
import { useTranslations } from "next-intl";
import type { TChartSwitchesProps } from "../../TempPrecipChart.type";

/**
 * The chart card's switches: chart type (Walter-Lieth / Standard, both drawn for every dataset)
 * and, where a page compares — Climate A / B, two cities, weather years — Side by side / Overlay.
 */
export function ChartSwitches({ chartMode, layout, onLayoutChange }: TChartSwitchesProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ChartModeSwitch value={chartMode} />
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
