import { FIGURE_PLACES, MONTH_NAMES } from "@/constants";
import {
  EAnnotationBand,
  EChartValueAxis,
  EDataStatus,
  EFigureAnchor,
  ESeriesKind,
  EStatsBarItem,
  EWalterLiethSeriesId,
} from "@/enums";
import type { TChartSeries, TFigureAnnotation, TFigurePlace, TMonthlyTemperature } from "@/types";
import { getPairMarker } from "@/utils/seriesShape.util";
import {
  getCurvesMidpoint,
  pickAridMonths,
  pickFrostMonth,
  pickFrostMonths,
  pickHumidMonth,
  pickVeryHumidMonths,
} from "@/utils/infoFigure.util";

// * WorldClim 2.1 via SCRAPI, 1970–2000 normals: mean max °C, mean min °C and precipitation mm per month
const BEIJING_MONTHS = [
  [1.7, -8.8, 5],
  [5.1, -6.1, 4],
  [11.7, 0, 10],
  [20.8, 7.9, 16],
  [26.5, 13.7, 31],
  [30.6, 18.5, 75],
  [31.3, 21.6, 206],
  [30, 20.4, 157],
  [26.2, 14.4, 45],
  [19.4, 7.4, 17],
  [10, -0.5, 7],
  [3.6, -6.3, 5],
] as const;

const SORIA_MONTHS = [
  [6.5, -2.2, 40],
  [8.4, -1.2, 41],
  [11.8, 0, 29],
  [13.3, 2, 50],
  [17.5, 5.5, 59],
  [22.7, 9.1, 46],
  [27.5, 11.8, 30],
  [27.5, 11.5, 26],
  [23.3, 8.6, 29],
  [16.3, 4.9, 44],
  [10.6, 1, 41],
  [7.3, -0.9, 44],
] as const;

const toMonthlyData = (months: typeof BEIJING_MONTHS | typeof SORIA_MONTHS) =>
  months.map(([tmax, tmin, prec], index): TMonthlyTemperature => ({
    month: index + 1,
    monthName: MONTH_NAMES[index] ?? "",
    tmax,
    tmin,
    prec,
  }));

const BEIJING_DATA = toMonthlyData(BEIJING_MONTHS);
const SORIA_DATA = toMonthlyData(SORIA_MONTHS);

const toFigureSeries = (place: TFigurePlace, data: TMonthlyTemperature[], altitude: number) =>
  ({
    id: "figure",
    kind: ESeriesKind.CITY,
    label: place.NAME,
    context: place.PERIOD,
    ...getPairMarker(EWalterLiethSeriesId.A),
    data,
    altitude,
    year: null,
    state: { status: EDataStatus.READY },
  }) satisfies TChartSeries;

export const WALTER_LIETH_FIGURE_SERIES: TChartSeries = toFigureSeries(
  FIGURE_PLACES.WALTER_LIETH,
  BEIJING_DATA,
  54,
);
export const INDICATORS_FIGURE_SERIES: TChartSeries = toFigureSeries(
  FIGURE_PLACES.INDICATORS,
  SORIA_DATA,
  1070,
);

const WALTER_LIETH_SERIES_LIST: readonly TChartSeries[] = [WALTER_LIETH_FIGURE_SERIES];
const INDICATORS_SERIES_LIST: readonly TChartSeries[] = [INDICATORS_FIGURE_SERIES];

export const FIGURE_VISIBLE_SERIES = { tmax: true, tavg: false, tmin: true, prec: true } as const;

const span = (key: string, months: readonly number[], band: EAnnotationBand, captionKey: string) =>
  months.length === 0
    ? []
    : [
        {
          key,
          anchor: { kind: EFigureAnchor.SPAN, months, band },
          captionKey,
        } satisfies TFigureAnnotation,
      ];

// * the annotated months, chosen from the data by their condition — never typed in
const HUMID = pickHumidMonth(BEIJING_DATA);

export const WALTER_LIETH_FIGURE = {
  PLACE: FIGURE_PLACES.WALTER_LIETH,
  SERIES_LIST: WALTER_LIETH_SERIES_LIST,
  ANNOTATIONS: [
    ...(HUMID === undefined
      ? []
      : [
          {
            key: "humid",
            anchor: {
              kind: EFigureAnchor.POINT,
              month: HUMID.month,
              axis: EChartValueAxis.TEMPERATURE,
              value: getCurvesMidpoint(HUMID),
            },
            captionKey: "chart.wlGuide.humid",
          } satisfies TFigureAnnotation,
        ]),
    ...span(
      "veryHumid",
      pickVeryHumidMonths(BEIJING_DATA),
      EAnnotationBand.TOP,
      "chart.wlGuide.veryHumid",
    ),
    ...span("arid", pickAridMonths(BEIJING_DATA), EAnnotationBand.TOP, "chart.wlGuide.arid"),
    ...span("frost", pickFrostMonths(BEIJING_DATA), EAnnotationBand.BOTTOM, "chart.wlGuide.frost"),
  ],
} as const;

const FROST = pickFrostMonth(SORIA_DATA);

export const INDICATORS_FIGURE = {
  PLACE: FIGURE_PLACES.INDICATORS,
  SERIES_LIST: INDICATORS_SERIES_LIST,
  ANNOTATIONS: [
    ...span(
      "aridBars",
      pickAridMonths(SORIA_DATA),
      EAnnotationBand.TOP,
      "info.data.indicators.figure.aridBar",
    ),
    ...(FROST === undefined
      ? []
      : [
          {
            key: "frostLine",
            anchor: {
              kind: EFigureAnchor.POINT,
              month: FROST.month,
              axis: EChartValueAxis.TEMPERATURE,
              value: FROST.tmin,
            },
            captionKey: "info.data.indicators.figure.frostLine",
          } satisfies TFigureAnnotation,
        ]),
    {
      key: "aridCount",
      anchor: { kind: EFigureAnchor.STATS_ITEM, item: EStatsBarItem.ARID_MONTHS },
      captionKey: "info.data.indicators.figure.aridCount",
    } satisfies TFigureAnnotation,
    {
      key: "martonne",
      anchor: { kind: EFigureAnchor.STATS_ITEM, item: EStatsBarItem.MARTONNE },
      captionKey: "info.data.indicators.figure.martonne",
    } satisfies TFigureAnnotation,
  ],
} as const;
