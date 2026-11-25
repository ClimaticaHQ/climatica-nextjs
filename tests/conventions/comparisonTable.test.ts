import { getLaterPeriodSeries } from "@/app/compare-periods/_components/ComparePeriods.util";
import { MISSING_VALUE_LABEL } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import type { TMonthlyTemperature } from "@/types";
import { buildComparisonTable, buildStatsTable } from "@/utils/comparisonTable.util";
import { describe, expect, it } from "vitest";

const UNITS = { celsius: "°C", mm: "mm", meters: "m" };

const months = (tmin: number, tmax: number, prec: number): TMonthlyTemperature[] =>
  Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: `M${i + 1}`,
    tmin: [0, 1, 11].includes(i) ? tmin - 8 : tmin,
    tmax,
    prec,
  }));

const valladolid = { id: EWalterLiethSeriesId.A, label: "Valladolid", altitude: 712 };
const lviv = { id: EWalterLiethSeriesId.B, label: "Lviv", altitude: 261 };

describe("buildComparisonTable", () => {
  const table = buildComparisonTable({
    units: UNITS,
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
    expect(row("frostMonths")?.a.text).toBe("3");
    expect(row("frostMonths")?.b.text).toBe("12");
    expect(row("martonne")?.a.badge).toBeDefined();
  });

  it("shows — for a missing value and leaves its difference out", () => {
    const gappy = months(5, 20, 35).map((m, i) => (i === 3 ? { ...m, tmin: null } : m));
    const withGap = buildComparisonTable({
      units: UNITS,
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

describe("differences of the displayed values", () => {
  const flat = (tmin: number, tmax: number, prec: number): TMonthlyTemperature[] =>
    Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: `M${i + 1}`,
      tmin,
      tmax,
      prec,
    }));
  const earlier = {
    id: EWalterLiethSeriesId.A,
    label: "1961–1990",
    altitude: 262,
    data: flat(4.94, 17.5, 72),
  };
  const later = {
    id: EWalterLiethSeriesId.B,
    label: "1991–2020",
    altitude: 262,
    data: flat(5.96, 18.7, 74),
  };

  it("the comparison table's difference equals the difference of the values beside it", () => {
    const table = buildComparisonTable({
      units: UNITS,
      seriesA: earlier,
      seriesB: later,
      minuend: EWalterLiethSeriesId.B,
      locale: "en",
    });
    const avgTmin = table.rows.find((r) => r.metric === "avgTmin");
    expect([avgTmin?.a.text, avgTmin?.b.text]).toEqual(["4.9 °C", "6.0 °C"]);
    expect(avgTmin?.difference).toBe("+1.1 °C");
  });

  it("the stats table's difference does too", () => {
    const table = buildStatsTable({
      units: UNITS,
      series: [
        { ...earlier, isLoading: false },
        { ...later, isLoading: false },
      ],
      minuendId: EWalterLiethSeriesId.B,
      locale: "en",
    });
    const avgTmin = table.rows.find((r) => r.metric === "avgTmin");
    expect(avgTmin?.values.map((v) => v?.text)).toEqual(["4.9 °C", "6.0 °C"]);
    expect(avgTmin?.difference).toBe("+1.1 °C");

    const martonne = table.rows.find((r) => r.metric === "martonne");
    const [shownA, shownB] = (martonne?.values ?? []).map((v) => Number(v?.text));
    expect(martonne?.difference).toBe(formatShownDifference(shownB ?? 0, shownA ?? 0));
  });
});

function formatShownDifference(minuend: number, subtrahend: number) {
  const tenths = Math.round(minuend * 10) - Math.round(subtrahend * 10);
  const sign = tenths > 0 ? "+" : tenths < 0 ? "−" : "±";
  return `${sign}${(Math.abs(tenths) / 10).toFixed(1)}`;
}
