import { Card } from "@/components/Card";
import { DataUpdateFade, DataUpdateProgress } from "@/components/DataUpdate";
import {
  DATA_UPDATE_ALL_SERIES,
  DEFAULT_CHART_MODE,
  DEFAULT_COMPARE_LAYOUT,
  NO_FLASH_KEYS,
  WALTER_LIETH_COMPARISON,
} from "@/constants";
import { ECompareLayout } from "@/enums";
import type { TChartMode } from "@/types";
import { useId } from "react";
import { ChartBody, ChartHeader, SecondaryControls } from "./components";
import { useChartSeries, useSubtitleText, useTempPrecipChart, useVisibleSeries } from "./hooks";
import { CHART_CARD_LAYOUT_CLASS, NO_PANEL_EXPANSION } from "./TempPrecipChart.constant";
import type { TTempPrecipChartProps } from "./TempPrecipChart.type";

export function TempPrecipChart(props: TTempPrecipChartProps) {
  const { visible, setVisible } = useVisibleSeries(props);
  // * controlled by the page (URL state), so shared links open in the same mode
  const chartMode: TChartMode = props.chartMode ?? DEFAULT_CHART_MODE;
  const chart = useTempPrecipChart(props);
  const subtitleText = useSubtitleText(props.subtitle);
  const syncId = useId();
  const { seriesSingle, comparison } = useChartSeries({ chartProps: props, chart, subtitleText });
  const layout = props.layout ?? DEFAULT_COMPARE_LAYOUT;
  // * in the split layout the panels flash, not the card around them
  const isSplit = chart.isCompare && layout === ECompareLayout.SPLIT;

  if (!chart.hasData) return null;

  const canUseWalterLieth = props.showWalterLiethToggle !== false && !chart.isMultiPeriod;
  const isWalterLieth = canUseWalterLieth && chartMode === "walter-lieth";
  // * kept across chart types; overlay ignores it, going back to split restores it
  const expansion = props.panelExpansion ?? NO_PANEL_EXPANSION;

  return (
    <Card
      flashKeys={isSplit ? NO_FLASH_KEYS : (props.flashKeys ?? DATA_UPDATE_ALL_SERIES)}
      shouldClip
      // * a comparison below `sm`: the panel cards frame the diagrams, so this card goes flat
      isFlatBelowSm={chart.isCompare}
      className={CHART_CARD_LAYOUT_CLASS}
    >
      <DataUpdateProgress />
      <ChartHeader
        chartProps={props}
        chartMode={chartMode}
        isWalterLieth={isWalterLieth}
        canUseWalterLieth={canUseWalterLieth}
        isCompare={chart.isCompare}
        layout={layout}
        subtitleText={subtitleText}
      />
      <SecondaryControls
        isWalterLieth={isWalterLieth}
        isOverlay={chart.isCompare && layout === ECompareLayout.OVERLAY}
        comparison={comparison}
        shading={props.wlShading ?? WALTER_LIETH_COMPARISON.DEFAULT_SHADING}
        onShadingChange={(shading) => props.onWlShadingChange?.(shading)}
        visible={visible}
        variables={props.variables}
        onVisibleChange={setVisible}
      />

      <DataUpdateFade>
        <ChartBody
          chartProps={props}
          chart={chart}
          seriesSingle={seriesSingle}
          comparison={comparison}
          visible={visible}
          isWalterLieth={isWalterLieth}
          layout={layout}
          syncId={syncId}
          expansion={expansion}
        />
      </DataUpdateFade>
    </Card>
  );
}
