import { formatCount, formatPrec, formatTemp } from "@/utils/monthlyClimate.util";
import type { TCompareStats } from "@/types";

export function buildClimateStatsRows(
  entities: Array<TCompareStats | undefined>,
  labels: string[],
): string[][] {
  const [tmaxLabel = "", tminLabel = "", precLabel = "", aridLabel = ""] = labels;
  const fmt = (entity: TCompareStats | undefined, fn: (s: TCompareStats) => string): string =>
    entity !== undefined ? fn(entity) : "—";

  return [
    [tmaxLabel, ...entities.map((s) => fmt(s, (e) => formatTemp(e.avgTmax)))],
    [tminLabel, ...entities.map((s) => fmt(s, (e) => formatTemp(e.avgTmin)))],
    [precLabel, ...entities.map((s) => fmt(s, (e) => formatPrec(e.totalPrec)))],
    [aridLabel, ...entities.map((s) => fmt(s, (e) => formatCount(e.aridMonths)))],
  ];
}
