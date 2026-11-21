"use client";

import { ChartLegend } from "@/components/ChartLegend";
import {
  ARIDITY_BAR_COLORS,
  STANDARD_CHART_SINGLE_COLORS,
} from "@/components/charts/charts.constant";
import { StandardClimateChartFrame } from "@/components/charts/StandardClimateChartFrame";
import { WalterLiethFrame } from "@/components/WalterLiethChart/components/WalterLiethFrame";
import { CHART_LEGEND } from "@/constants";
import { EFigureAnchor } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import { useLegendLabels, useWalterLiethLegendItems } from "@/hooks/ui";
import { getStandardLegendItems } from "@/utils";
import { useTranslations } from "next-intl";
import type { TFigureChartLoadingProps } from "../info.type";
import { FIGURE_SERIES_LIST, FIGURE_VISIBLE_SERIES, INDICATORS_FIGURE } from "./figures.constant";
import { InfoFigureMarker } from "./InfoFigure";

/*
 * The figures' frames without chart code (so they stay out of the lazy chart module): the
 * legends and the stats bar's numbers the pictures (FigureCharts) draw, and the pictures'
 * skeletons — the same frames around a ChartSkeleton — while that module loads.
 */

export function WalterLiethFigureLegend() {
  const items = useWalterLiethLegendItems();
  return (
    <div className={CHART_LEGEND.GAP_CLASS}>
      <ChartLegend items={items} />
    </div>
  );
}

export function IndicatorsFigureLegend() {
  const labels = useLegendLabels();
  const items = getStandardLegendItems({
    labels,
    colors: STANDARD_CHART_SINGLE_COLORS,
    visible: FIGURE_VISIBLE_SERIES,
    aridity: ARIDITY_BAR_COLORS,
  });
  return (
    <div className={CHART_LEGEND.GAP_CLASS}>
      <ChartLegend items={items} />
    </div>
  );
}

/** The indicators figure's numbers on its stats bar, by item. */
export function getIndicatorsStatsMarkers() {
  return Object.fromEntries(
    INDICATORS_FIGURE.ANNOTATIONS.flatMap(({ anchor }, index) =>
      anchor.kind === EFigureAnchor.STATS_ITEM
        ? [[anchor.item, <InfoFigureMarker key={anchor.item} number={index + 1} />]]
        : [],
    ),
  );
}

/** A figure's picture while its chart module loads (on the server too); the region says so. */
function FigureChartLoading({ children }: TFigureChartLoadingProps) {
  const t = useTranslations();
  return (
    <div aria-busy="true">
      <span className="sr-only">{t("loading.chart")}</span>
      <div aria-hidden>{children}</div>
    </div>
  );
}

export function WalterLiethFigureSkeleton() {
  const series = useChartModel(FIGURE_SERIES_LIST).series[0]?.walterLieth;
  if (series === undefined) return null;
  return (
    <FigureChartLoading>
      <WalterLiethFrame series={series} summary={null} footer={<WalterLiethFigureLegend />} />
    </FigureChartLoading>
  );
}

export function IndicatorsFigureSkeleton() {
  return (
    <FigureChartLoading>
      <StandardClimateChartFrame
        statsMarkers={getIndicatorsStatsMarkers()}
        footer={<IndicatorsFigureLegend />}
      />
    </FigureChartLoading>
  );
}
