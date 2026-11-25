import { DISPLAY_PRECISION, MISSING_VALUE_LABEL } from "@/constants";
import { EDisplayMetric, ENumberSign } from "@/enums";
import type { TCompareStats } from "@/types";
import { buildClimateStatsRows } from "@/utils/climateExport.util";
import {
  displayDifference,
  formatDifference,
  formatValue,
  roundForDisplay,
} from "@/utils/displayFormat.util";
import { formatPrec, formatTemp } from "@/utils/monthlyClimate.util";
import { describe, expect, it } from "vitest";

const MINUS = "−";
const { TEMPERATURE, PRECIPITATION, MARTONNE, CELL_COUNT, ELEVATION } = EDisplayMetric;

describe("DISPLAY_PRECISION", () => {
  it("defines every metric's decimals", () => {
    expect(DISPLAY_PRECISION[TEMPERATURE].digits).toBe(1);
    expect(DISPLAY_PRECISION[PRECIPITATION].digits).toBe(0);
    expect(DISPLAY_PRECISION[ELEVATION].digits).toBe(0);
    expect(DISPLAY_PRECISION[MARTONNE].digits).toBe(1);
    expect(DISPLAY_PRECISION[EDisplayMetric.MONTH_COUNT].digits).toBe(0);
    expect(DISPLAY_PRECISION[CELL_COUNT]).toEqual({ digits: 0, hasGrouping: true });
    for (const metric of Object.values(EDisplayMetric)) {
      expect(DISPLAY_PRECISION[metric]).toBeDefined();
    }
  });
});

describe("roundForDisplay", () => {
  it("rounds to the metric's decimals", () => {
    expect(roundForDisplay(4.94, TEMPERATURE)).toBe(4.9);
    expect(roundForDisplay(5.96, TEMPERATURE)).toBe(6);
    expect(roundForDisplay(1234.5, PRECIPITATION)).toBe(1235);
    expect(roundForDisplay(37.26, MARTONNE)).toBe(37.3);
  });

  it("rounds half away from zero on the exact value, as Intl.NumberFormat does", () => {
    expect(roundForDisplay(2.5, PRECIPITATION)).toBe(3);
    expect(roundForDisplay(-2.5, PRECIPITATION)).toBe(-3);
    expect(roundForDisplay(-3.65, TEMPERATURE)).toBe(-3.6);
    // * 1.05 is stored as 1.0500000000000000444…: just above the half, so up
    expect(roundForDisplay(1.05, TEMPERATURE)).toBe(1.1);
    // * 2.675 is stored as 2.67499999…: just below the half, so down — as the formatter prints it
    expect(roundForDisplay(2.675, EDisplayMetric.CHART_TOOLTIP_VALUE)).toBe(2.67);
  });

  it("never gives a negative zero", () => {
    expect(Object.is(roundForDisplay(-0.04, TEMPERATURE), 0)).toBe(true);
  });
});

describe("displayDifference", () => {
  it("is the difference of the displayed values", () => {
    expect(displayDifference({ minuend: 5.96, subtrahend: 4.94, metric: TEMPERATURE })).toBe(1.1);
    expect(displayDifference({ minuend: 36.64, subtrahend: 37.26, metric: MARTONNE })).toBe(-0.7);
  });

  it("leaves no floating-point artefacts", () => {
    expect(displayDifference({ minuend: 6.0, subtrahend: 4.9, metric: TEMPERATURE })).toBe(1.1);
    expect(displayDifference({ minuend: 0.3, subtrahend: 0.1, metric: TEMPERATURE })).toBe(0.2);
  });

  it("is 0 for values that round to the same number, null for an unknown one", () => {
    expect(displayDifference({ minuend: 12.04, subtrahend: 11.96, metric: TEMPERATURE })).toBe(0);
    expect(displayDifference({ minuend: null, subtrahend: 1, metric: TEMPERATURE })).toBeNull();
    expect(
      displayDifference({ minuend: 1, subtrahend: Number.NaN, metric: TEMPERATURE }),
    ).toBeNull();
  });
});

describe("formatValue", () => {
  it("uses the locale's decimal separator and the metric's decimals", () => {
    expect(formatValue(12.34, { metric: TEMPERATURE, locale: "en" })).toBe("12.3");
    expect(formatValue(12.34, { metric: TEMPERATURE, locale: "es" })).toBe("12,3");
    expect(formatValue(4, { metric: TEMPERATURE, locale: "de" })).toBe("4,0");
    expect(formatValue(36.6, { metric: PRECIPITATION, locale: "es" })).toBe("37");
  });

  it("formats negative values in each sign style", () => {
    expect(formatValue(-3.64, { metric: TEMPERATURE, locale: "en" })).toBe("-3.6");
    expect(formatValue(-3.64, { metric: TEMPERATURE, locale: "uk", sign: ENumberSign.MINUS })).toBe(
      `${MINUS}3,6`,
    );
    expect(formatValue(3.64, { metric: TEMPERATURE, locale: "es", sign: ENumberSign.MINUS })).toBe(
      "3,6",
    );
  });

  it("never shows a negative zero", () => {
    expect(formatValue(-0.04, { metric: TEMPERATURE, locale: "en" })).toBe("0.0");
    expect(formatValue(-0.04, { metric: TEMPERATURE, locale: "es", sign: ENumberSign.MINUS })).toBe(
      "0,0",
    );
  });

  it("reads a missing value as —", () => {
    expect(formatValue(null, { metric: TEMPERATURE, locale: "en" })).toBe(MISSING_VALUE_LABEL);
    expect(formatValue(undefined, { metric: TEMPERATURE, locale: "es" })).toBe(MISSING_VALUE_LABEL);
    expect(formatValue(Number.NaN, { metric: TEMPERATURE, locale: "uk" })).toBe(
      MISSING_VALUE_LABEL,
    );
  });

  it("groups thousands only for counts", () => {
    expect(formatValue(1234.5, { metric: TEMPERATURE, locale: "en" })).toBe("1234.5");
    expect(formatValue(12345, { metric: CELL_COUNT, locale: "en" })).toBe("12,345");
    expect(formatValue(12345, { metric: CELL_COUNT, locale: "de" })).toBe("12.345");
    expect(formatValue(12345, { metric: CELL_COUNT, locale: "uk" })).toMatch(/^12\s345$/);
  });

  it("prints the rounded value exactly as the formatter would print the raw one", () => {
    for (const value of [1.05, 2.25, -7.45, 12.349, 99.95, 0.05]) {
      const locale = "en";
      const rounded = roundForDisplay(value, TEMPERATURE);
      expect(formatValue(value, { metric: TEMPERATURE, locale })).toBe(
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
          useGrouping: false,
          signDisplay: "negative",
        }).format(value),
      );
      expect(formatValue(rounded, { metric: TEMPERATURE, locale })).toBe(
        formatValue(value, { metric: TEMPERATURE, locale }),
      );
    }
  });
});

describe("formatDifference", () => {
  const difference = (minuend: number, subtrahend: number, metric = TEMPERATURE, locale = "en") =>
    formatDifference({ minuend, subtrahend, metric, locale });

  it("equals the difference of the values shown beside it", () => {
    // * Bolzano, 1991–2020 vs 1961–1990: 6.0 and 4.9 shown → +1.1, not +1.0
    expect(difference(5.96, 4.94)).toBe("+1.1");
    // * Martonne 36.6 and 37.3 shown → −0.7, not −0.6
    expect(difference(36.64, 37.26, MARTONNE)).toBe(`${MINUS}0.7`);
  });

  it("shows ±0 for values that round to the same number", () => {
    expect(difference(12.04, 11.96)).toBe("±0.0");
    expect(difference(405.4, 404.6, PRECIPITATION)).toBe("±0");
  });

  it("signs negative values and crossings of zero with a real minus", () => {
    expect(difference(-3.64, -1.26)).toBe(`${MINUS}2.3`);
    expect(difference(0.04, -0.06)).toBe("+0.1");
    // * −5.55 is stored just above −5.55, so it shows as −5,5
    expect(difference(-5.55, 2.0, TEMPERATURE, "uk")).toBe(`${MINUS}7,5`);
  });

  it("uses each metric's decimals", () => {
    expect(difference(1234.6, 1000.2, PRECIPITATION)).toBe("+235");
    expect(difference(812.4, 260.6, ELEVATION)).toBe("+551");
  });

  it("reads an unknown side as —", () => {
    expect(
      formatDifference({ minuend: null, subtrahend: 1, metric: TEMPERATURE, locale: "en" }),
    ).toBe(MISSING_VALUE_LABEL);
  });
});

describe("CSV values", () => {
  const stats: TCompareStats = {
    avgTmax: 24.85,
    avgTmin: -3.64,
    totalPrec: 1234.4,
    aridMonths: 3,
    martonneIndex: 29.9,
  };

  it("keep '.' as the decimal separator, whatever the UI's locale", () => {
    expect(formatTemp(-3.64)).toBe("-3.6 °C");
    expect(formatPrec(1234.4)).toBe("1234 mm");
    expect(buildClimateStatsRows([stats], ["Tmax", "Tmin", "Prec", "Arid"])).toEqual([
      ["Tmax", "24.9 °C"],
      ["Tmin", "-3.6 °C"],
      ["Prec", "1234 mm"],
      ["Arid", "3"],
    ]);
  });
});
