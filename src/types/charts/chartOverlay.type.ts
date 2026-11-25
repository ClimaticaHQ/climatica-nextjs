import type { EChartValueAxis } from "@/enums";
import type { ReactNode } from "react";

export type TPlotBox = { left: number; right: number; top: number; bottom: number };

export type TChartProjection = {
  x: (month: number) => number;
  y: (axis: EChartValueAxis, value: number) => number;
  monthWidth: number;
  plot: TPlotBox;
  chartBottom: number;
};

export type TChartOverlay = (projection: TChartProjection) => ReactNode;

export type TAnnotationBands = { top: number; bottom: number };

export type TChartOverlayLayerProps = {
  render: TChartOverlay;
  xValueOf: (month: number) => number | string;
  temperatureAxisId: string;
  precipitationAxisId: string;
  /** the Walter-Lieth diagram plots mm through the °C axis */
  toPrecipitationAxis?: (mm: number) => number;
};
