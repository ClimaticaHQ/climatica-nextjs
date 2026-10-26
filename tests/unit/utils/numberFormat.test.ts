import { MISSING_VALUE_LABEL } from "@/constants";
import { ENumberSign } from "@/enums";
import type { TCompareStats } from "@/types";
import { buildClimateStatsRows } from "@/utils/climateExport.util";
import { formatPrec, formatTemp } from "@/utils/monthlyClimate.util";
import { formatNumber } from "@/utils/numberFormat.util";
import { describe, expect, it } from "vitest";

const MINUS = "−";

describe("formatNumber", () => {
  it("uses the locale's decimal separator, with the value's own decimals", () => {
    expect(formatNumber(12.34, { locale: "en", digits: 1 })).toBe("12.3");
    expect(formatNumber(12.34, { locale: "es", digits: 1 })).toBe("12,3");
    expect(formatNumber(12.34, { locale: "uk", digits: 1 })).toBe("12,3");
    expect(formatNumber(4, { locale: "de", digits: 1 })).toBe("4,0");
    expect(formatNumber(36.6, { locale: "es" })).toBe("37");
  });

  it("formats negative values in each sign style", () => {
    expect(formatNumber(-3.64, { locale: "en", digits: 1 })).toBe("-3.6");
    expect(formatNumber(-3.64, { locale: "es", digits: 1 })).toBe("-3,6");
    expect(formatNumber(-3.64, { locale: "uk", digits: 1, sign: ENumberSign.MINUS })).toBe(
      `${MINUS}3,6`,
    );
    expect(formatNumber(3.64, { locale: "es", digits: 1, sign: ENumberSign.MINUS })).toBe("3,6");
  });

  it("signs differences: +, a real minus, or ± for none", () => {
    const signed = (value: number, locale: string) =>
      formatNumber(value, { locale, digits: 1, sign: ENumberSign.SIGNED });
    expect(signed(5, "en")).toBe("+5.0");
    expect(signed(-1.5, "es")).toBe(`${MINUS}1,5`);
    expect(signed(0, "uk")).toBe("±0,0");
  });

  it("never shows a negative zero", () => {
    expect(formatNumber(-0.04, { locale: "en", digits: 1 })).toBe("0.0");
    expect(formatNumber(-0.04, { locale: "es", digits: 1 })).toBe("0,0");
  });

  it("reads a missing value as —", () => {
    expect(formatNumber(null, { locale: "en", digits: 1 })).toBe(MISSING_VALUE_LABEL);
    expect(formatNumber(undefined, { locale: "es" })).toBe(MISSING_VALUE_LABEL);
    expect(formatNumber(Number.NaN, { locale: "uk" })).toBe(MISSING_VALUE_LABEL);
  });

  it("groups thousands only for counts", () => {
    expect(formatNumber(1234.5, { locale: "en", digits: 1 })).toBe("1234.5");
    expect(formatNumber(1234.5, { locale: "es", digits: 1 })).toBe("1234,5");
    expect(formatNumber(12345, { locale: "en", hasGrouping: true })).toBe("12,345");
    expect(formatNumber(12345, { locale: "de", hasGrouping: true })).toBe("12.345");
    expect(formatNumber(12345, { locale: "uk", hasGrouping: true })).toMatch(/^12\s345$/);
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
