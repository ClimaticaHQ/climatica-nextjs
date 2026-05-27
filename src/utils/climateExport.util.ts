import type { TCompareStats } from "@/types";

export function buildClimateStatsRows(
  entities: Array<TCompareStats | undefined>,
  labels: string[],
): string[][] {
  const [tmaxLabel = "", tminLabel = "", precLabel = "", aridLabel = ""] = labels;
  const fmt = (entity: TCompareStats | undefined, fn: (s: TCompareStats) => string): string =>
    entity !== undefined ? fn(entity) : "—";

  return [
    [tmaxLabel, ...entities.map((s) => fmt(s, (e) => `${e.avgTmax.toFixed(1)} °C`))],
    [tminLabel, ...entities.map((s) => fmt(s, (e) => `${e.avgTmin.toFixed(1)} °C`))],
    [precLabel, ...entities.map((s) => fmt(s, (e) => `${e.totalPrec.toFixed(0)} mm`))],
    [aridLabel, ...entities.map((s) => fmt(s, (e) => String(e.aridMonths)))],
  ];
}
