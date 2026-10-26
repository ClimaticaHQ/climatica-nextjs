import { getEntityMarker, getPairMarker } from "@/utils/seriesShape.util";
import { DATA_UPDATE_SINGLE_SERIES, MONTH_NAMES } from "@/constants";
import { EDataStatus, ESeriesKind, EWalterLiethSeriesId } from "@/enums";
import type { TChartSeries, TMonthlyTemperature } from "@/types";

/** Twelve months, shifted so each series differs; a gap (null) where asked. */
export function months(shift: number, gapMonth?: number): TMonthlyTemperature[] {
  return MONTH_NAMES.map((monthName, i) => ({
    month: i + 1,
    monthName,
    tmin: i + 1 === gapMonth ? null : -4 + i + shift,
    tmax: 6 + i * 2 + shift,
    prec: 80 - i * 6 + shift * 3,
  }));
}

const READY = { status: EDataStatus.READY } as const;

export const CITY: TChartSeries = {
  id: DATA_UPDATE_SINGLE_SERIES,
  kind: ESeriesKind.CITY,
  label: "Valladolid",
  context: "Climate 1970–2000",
  ...getPairMarker(EWalterLiethSeriesId.A),
  data: months(0),
  altitude: 690,
  year: null,
  state: READY,
};

export const CITY_PAIR: TChartSeries[] = [
  { ...CITY, id: EWalterLiethSeriesId.A },
  {
    ...CITY,
    id: EWalterLiethSeriesId.B,
    label: "Lviv",
    ...getPairMarker(EWalterLiethSeriesId.B),
    data: months(-3),
    altitude: 296,
  },
];

export const PERIOD_PAIR: TChartSeries[] = CITY_PAIR.map((series, i) => ({
  ...series,
  kind: ESeriesKind.CLIMATE_PERIOD,
  label: i === 0 ? "1970–2000" : "2021–2040",
  context: "Valladolid",
  altitude: 690,
}));

export function weatherYears(years: readonly number[]): TChartSeries[] {
  return years.map((year, i) => ({
    id: String(year),
    kind: ESeriesKind.WEATHER_YEAR,
    label: String(year),
    context: "Valladolid",
    ...getEntityMarker(i),
    data: months(i),
    altitude: 690,
    year,
    state: READY,
  }));
}
