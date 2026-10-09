import type { TWalterLiethSeriesInput, TYearOption } from "@/types";

/** The compared years and their colours, from the per-year series. */
export function toYearOptions(series: readonly TWalterLiethSeriesInput[]): TYearOption[] {
  return series.flatMap(({ singleYear, markerColor }) =>
    singleYear !== undefined && markerColor !== undefined
      ? [{ year: singleYear, color: markerColor }]
      : [],
  );
}

export function findYearSeries(series: readonly TWalterLiethSeriesInput[], year: number) {
  return series.find(({ singleYear }) => singleYear === year);
}
