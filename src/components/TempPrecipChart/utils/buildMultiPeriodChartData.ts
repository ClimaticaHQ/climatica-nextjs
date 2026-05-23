import type { TMultiPeriodEntry } from "../TempPrecipChart.type";

export function buildMultiPeriodChartData(periods: TMultiPeriodEntry[]): Record<string, unknown>[] {
  const base = periods[0]?.rows ?? [];
  return base.map((row, i) => {
    const entry: Record<string, unknown> = {
      month: row.month,
      monthName: row.monthName,
    };
    for (const { year, rows } of periods) {
      const r = rows[i];
      if (r) {
        entry[`${year}_tmax`] = r.tmax;
        entry[`${year}_tmin`] = r.tmin;
        entry[`${year}_prec`] = r.prec;
      }
    }
    return entry;
  });
}
