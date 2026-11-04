"use client";

import { ChartLegend } from "@/components/ChartLegend";
import {
  ARIDITY_BAR_COLORS,
  STANDARD_CHART_SINGLE_COLORS,
} from "@/components/charts/charts.constant";
import { ChartDeviceContext } from "@/components/charts/chartDevice.context";
import { StandardClimateChart } from "@/components/charts/StandardClimateChart";
import { WalterLiethChart } from "@/components/WalterLiethChart";
import { CHART_LEGEND, SM_MEDIA_QUERY } from "@/constants";
import { EFigureAnchor } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import { useLegendLabels, useMediaQuery, useWalterLiethLegendItems } from "@/hooks/ui";
import { getStandardLegendItems, isCompleteSeries } from "@/utils";
import { getAnnotationBands } from "@/utils/infoFigure.util";
import { ANNOTATION_LAYOUT } from "../info.constant";
import { FigureAnnotations } from "./FigureAnnotations";
import {
  FIGURE_SERIES_LIST,
  FIGURE_VISIBLE_SERIES,
  INDICATORS_FIGURE,
  WALTER_LIETH_FIGURE,
} from "./figures.constant";
import { InfoFigureMarker } from "./InfoFigure";

/**
 * The figures' pictures: the app's own charts of the fixture, static, annotated, with their
 * legends. A picture is never touch; it takes the phone's narrow axes, as the chart card does.
 */
export function WalterLiethFigureChart() {
  const model = useChartModel(FIGURE_SERIES_LIST);
  const legendItems = useWalterLiethLegendItems();
  const isNarrow = !useMediaQuery(SM_MEDIA_QUERY);
  const series = model.series[0]?.walterLieth;
  if (series === undefined || !isCompleteSeries(series)) return null;
  const { ANNOTATIONS } = WALTER_LIETH_FIGURE;

  return (
    <ChartDeviceContext.Provider value={{ isTouch: false, isNarrow }}>
      <WalterLiethChart
        series={series}
        domain={model.domain}
        isStatic
        annotationBands={getAnnotationBands({
          annotations: ANNOTATIONS,
          layout: ANNOTATION_LAYOUT,
        })}
        overlay={(projection) => (
          <FigureAnnotations annotations={ANNOTATIONS} projection={projection} />
        )}
        footer={
          <div className={CHART_LEGEND.GAP_CLASS}>
            <ChartLegend items={legendItems} />
          </div>
        }
      />
    </ChartDeviceContext.Provider>
  );
}

/** The standard chart's picture: its annotations on the chart, and on the stats bar by item. */
export function IndicatorsFigureChart() {
  const model = useChartModel(FIGURE_SERIES_LIST);
  const labels = useLegendLabels();
  const isNarrow = !useMediaQuery(SM_MEDIA_QUERY);
  const entry = model.series[0];
  if (entry === undefined) return null;
  const { ANNOTATIONS } = INDICATORS_FIGURE;

  const statsMarkers = Object.fromEntries(
    ANNOTATIONS.flatMap(({ anchor }, index) =>
      anchor.kind === EFigureAnchor.STATS_ITEM
        ? [[anchor.item, <InfoFigureMarker key={anchor.item} number={index + 1} />]]
        : [],
    ),
  );
  const legend = getStandardLegendItems({
    labels,
    colors: STANDARD_CHART_SINGLE_COLORS,
    visible: FIGURE_VISIBLE_SERIES,
    aridity: ARIDITY_BAR_COLORS,
  });

  return (
    <ChartDeviceContext.Provider value={{ isTouch: false, isNarrow }}>
      <StandardClimateChart
        chartData={entry.chartData}
        aridity={entry.aridity}
        summary={entry.summary}
        scales={model.scales}
        rightMax={model.rightMax}
        visible={FIGURE_VISIBLE_SERIES}
        {...(entry.series.altitude !== null ? { altitude: entry.series.altitude } : {})}
        isStatic
        annotationBands={getAnnotationBands({
          annotations: ANNOTATIONS,
          layout: ANNOTATION_LAYOUT,
        })}
        statsMarkers={statsMarkers}
        overlay={(projection) => (
          <FigureAnnotations annotations={ANNOTATIONS} projection={projection} />
        )}
        footer={
          <div className={CHART_LEGEND.GAP_CLASS}>
            <ChartLegend items={legend} />
          </div>
        }
      />
    </ChartDeviceContext.Provider>
  );
}
