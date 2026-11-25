"use client";

import { ChartDeviceContext } from "@/components/charts/chartDevice.context";
import { StandardClimateChart } from "@/components/charts/StandardClimateChart";
import { WalterLiethChart } from "@/components/WalterLiethChart";
import { SM_MEDIA_QUERY } from "@/constants";
import { useChartModel } from "@/hooks/charts/useChartModel";
import { useMediaQuery, useTextScale } from "@/hooks/ui";
import { isCompleteSeries } from "@/utils";
import { getAnnotationBands, scaleAnnotationLayout } from "@/utils/infoFigure.util";
import { ANNOTATION_LAYOUT, FIGURE_PICTURE_CLASS } from "../info.constant";
import { FigureAnnotations } from "./FigureAnnotations";
import { FIGURE_VISIBLE_SERIES, INDICATORS_FIGURE, WALTER_LIETH_FIGURE } from "./figures.constant";
import {
  getIndicatorsStatsMarkers,
  IndicatorsFigureLegend,
  WalterLiethFigureLegend,
} from "./FigureFrames";

export function WalterLiethFigureChart() {
  const model = useChartModel(WALTER_LIETH_FIGURE.SERIES_LIST);
  const isNarrow = !useMediaQuery(SM_MEDIA_QUERY);
  const textScale = useTextScale();
  const layout = scaleAnnotationLayout({ layout: ANNOTATION_LAYOUT, textScale });
  const series = model.series[0]?.walterLieth;
  if (series === undefined || !isCompleteSeries(series)) return null;
  const { ANNOTATIONS } = WALTER_LIETH_FIGURE;

  return (
    <div aria-hidden className={FIGURE_PICTURE_CLASS}>
      <ChartDeviceContext.Provider value={{ isTouch: false, isNarrow, textScale }}>
        <WalterLiethChart
          series={series}
          domain={model.domain}
          isStatic
          annotationBands={getAnnotationBands({
            annotations: ANNOTATIONS,
            layout,
          })}
          overlay={(projection) => (
            <FigureAnnotations annotations={ANNOTATIONS} projection={projection} layout={layout} />
          )}
          footer={<WalterLiethFigureLegend />}
        />
      </ChartDeviceContext.Provider>
    </div>
  );
}

export function IndicatorsFigureChart() {
  const model = useChartModel(INDICATORS_FIGURE.SERIES_LIST);
  const isNarrow = !useMediaQuery(SM_MEDIA_QUERY);
  const textScale = useTextScale();
  const layout = scaleAnnotationLayout({ layout: ANNOTATION_LAYOUT, textScale });
  const entry = model.series[0];
  if (entry === undefined) return null;
  const { ANNOTATIONS } = INDICATORS_FIGURE;

  return (
    <div aria-hidden className={FIGURE_PICTURE_CLASS}>
      <ChartDeviceContext.Provider value={{ isTouch: false, isNarrow, textScale }}>
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
            layout,
          })}
          statsMarkers={getIndicatorsStatsMarkers()}
          overlay={(projection) => (
            <FigureAnnotations annotations={ANNOTATIONS} projection={projection} layout={layout} />
          )}
          footer={<IndicatorsFigureLegend />}
        />
      </ChartDeviceContext.Provider>
    </div>
  );
}
