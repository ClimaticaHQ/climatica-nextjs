import { FIGURE_PLACE, MONTH_NAMES } from "@/constants";
import {
  EAnnotationBand,
  EChartValueAxis,
  EDataStatus,
  EFigureAnchor,
  ESeriesKind,
  EStatsBarItem,
  EWalterLiethSeriesId,
} from "@/enums";
import type { TChartSeries, TFigureAnnotation, TMonthlyTemperature } from "@/types";
import { getPairMarker } from "@/utils/seriesShape.util";
import {
  getCurvesMidpoint,
  pickAridMonths,
  pickFrostMonth,
  pickFrostMonths,
  pickHumidMonth,
} from "@/utils/infoFigure.util";

// * WorldClim 2.1 via SCRAPI, 2.5′ grid, Soria (41.7636, −2.4649), 1970–2000 normals; cell 1070 m
// * — per month: mean maximum °C, mean minimum °C, precipitation mm
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

const SORIA_DATA: TMonthlyTemperature[] = SORIA_MONTHS.map(([tmax, tmin, prec], index) => ({
  month: index + 1,
  monthName: MONTH_NAMES[index] ?? "",
  tmax,
  tmin,
  prec,
}));

// * the figures' one series: a City Climate series in all but its source
export const FIGURE_SERIES: TChartSeries = {
  id: "figure",
  kind: ESeriesKind.CITY,
  label: FIGURE_PLACE.NAME,
  context: FIGURE_PLACE.PERIOD,
  ...getPairMarker(EWalterLiethSeriesId.A),
  data: SORIA_DATA,
  altitude: 1070,
  year: null,
  state: { status: EDataStatus.READY },
};

// * as a series list, one stable reference for the chart model
export const FIGURE_SERIES_LIST: readonly TChartSeries[] = [FIGURE_SERIES];

// * the standard chart figure shows the lines and bars the indicators read: no mean line
export const FIGURE_VISIBLE_SERIES = { tmax: true, tavg: false, tmin: true, prec: true } as const;

// * the annotated months, chosen from the data by their condition — never typed in
const HUMID = pickHumidMonth(SORIA_DATA);
const FROST = pickFrostMonth(SORIA_DATA);
const ARID_MONTHS = pickAridMonths(SORIA_DATA);
const FROST_MONTHS = pickFrostMonths(SORIA_DATA);

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

// * figure 1, the Walter-Lieth diagram: its caption is the chart's own guide, numbered
export const WALTER_LIETH_FIGURE = {
  ANNOTATIONS: [
    // * a point between the wettest humid month's two curves: the middle of its hatching
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
    ...span("arid", ARID_MONTHS, EAnnotationBand.TOP, "chart.wlGuide.arid"),
    // * under the month labels, where the frost band is
    ...span("frost", FROST_MONTHS, EAnnotationBand.BOTTOM, "chart.wlGuide.frost"),
  ],
  // * no month above 100 mm in the fixture: the compressed scale goes in an unnumbered line
  NOTE_KEY: "chart.wlGuide.veryHumid",
} as const;

// * figure 2, the standard chart and its stats bar: where each indicator shows
export const INDICATORS_FIGURE = {
  ANNOTATIONS: [
    ...span("aridBars", ARID_MONTHS, EAnnotationBand.TOP, "info.data.indicators.figure.aridBar"),
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
