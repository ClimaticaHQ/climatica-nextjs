import { getLaterPeriodSeries } from "@/app/compare-periods/_components/ComparePeriods.util";
import { MISSING_VALUE_LABEL } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type { TMonthlyTemperature } from "@/types";
import { buildComparisonTable } from "@/utils/comparisonTable.util";
import { describe, expect, it } from "vitest";

const months = (tmin: number, tmax: number, prec: number): TMonthlyTemperature[] =>
  Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: `M${i + 1}`,
    // * winter months (Jan, Feb, Dec) 8 °C colder
    tmin: [0, 1, 11].includes(i) ? tmin - 8 : tmin,
    tmax,
    prec,
  }));

const valladolid = { id: EWalterLiethSeriesId.A, label: "Valladolid", altitude: 712 };
const lviv = { id: EWalterLiethSeriesId.B, label: "Lviv", altitude: 261 };

describe("buildComparisonTable", () => {
  const table = buildComparisonTable({
    seriesA: { ...valladolid, data: months(5, 20, 35) },
    seriesB: { ...lviv, data: months(-2, 10, 55) },
    minuend: EWalterLiethSeriesId.B,
    locale: "en",
  });
  const row = (metric: string) => table.rows.find((r) => r.metric === metric);

  it("lists the metrics in order, with B − A as the difference direction", () => {
    expect(table.rows.map((r) => r.metric)).toEqual([
      "meanTemp",
      "avgTmax",
      "avgTmin",
      "annualPrec",
      "aridMonths",
      "frostMonths",
      "altitude",
      "martonne",
    ]);
    expect([table.minuend, table.subtrahend]).toEqual(["Lviv", "Valladolid"]);
  });

  it("formats values and differences with real minus signs and units", () => {
    expect(row("avgTmin")?.b.text).toBe("−4.0 °C");
    expect(row("avgTmax")?.difference).toBe("−10.0 °C");
    expect(row("annualPrec")?.difference).toBe("+240 mm");
    expect(row("altitude")?.difference).toBe("−451 m");
  });

  it("counts frost months by the WL rule and badges the Martonne index", () => {
    // * A: only the three winter months (5 − 8 °C) dip below 0 °C; B: every month
    expect(row("frostMonths")?.a.text).toBe("3");
    expect(row("frostMonths")?.b.text).toBe("12");
    expect(row("martonne")?.a.badge).toBeDefined();
  });

  it("shows — for a missing value and leaves its difference out", () => {
    const gappy = months(5, 20, 35).map((m, i) => (i === 3 ? { ...m, tmin: null } : m));
    const withGap = buildComparisonTable({
      seriesA: { ...valladolid, data: gappy },
      seriesB: { ...lviv, data: months(-2, 10, 55) },
      minuend: EWalterLiethSeriesId.B,
      locale: "en",
    });
    const avgTmin = withGap.rows.find((r) => r.metric === "avgTmin");
    expect(avgTmin?.a.text).toBe(MISSING_VALUE_LABEL);
    expect(avgTmin?.difference).toBeNull();
  });

  it("periods: the later period is the minuend, whatever the selection order", () => {
    expect(getLaterPeriodSeries("c1991-2020", "c1970-2000")).toBe(EWalterLiethSeriesId.A);
    expect(getLaterPeriodSeries("c1961-1990", "c1981-2010")).toBe(EWalterLiethSeriesId.B);
  });
});
