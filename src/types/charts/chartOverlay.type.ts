import type { EChartValueAxis } from "@/enums";
import type { ReactNode } from "react";

/** The plot's box in the chart's SVG (px). */
export type TPlotBox = { left: number; right: number; top: number; bottom: number };

/**
 * A chart's own projection, data space → the SVG's pixels, for annotations: a calendar month
 * (1–12) to the middle of its column, a value on an axis to its y; the plot's box, a month's
 * width, and the chart's bottom edge (under the month labels).
 */
export type TChartProjection = {
  x: (month: number) => number;
  y: (axis: EChartValueAxis, value: number) => number;
  monthWidth: number;
  plot: TPlotBox;
  chartBottom: number;
};

/** Drawn over a chart, in its SVG, through its projection. */
export type TChartOverlay = (projection: TChartProjection) => ReactNode;

/** Extra room (px) a chart keeps above its plot and below its month labels for annotations. */
export type TAnnotationBands = { top: number; bottom: number };

export type TChartOverlayLayerProps = {
  render: TChartOverlay;
  /** the x axis value of a calendar month (1–12): its position, or its category name */
  xValueOf: (month: number) => number | string;
  temperatureAxisId: string;
  precipitationAxisId: string;
  /** mm to the precipitation axis' own values (the Walter-Lieth diagram plots mm through °C) */
  toPrecipitationAxis?: (mm: number) => number;
};
