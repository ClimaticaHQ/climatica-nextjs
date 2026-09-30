import { MISSING_VALUE_LABEL } from "@/constants";
import type { TMonthlyTemperatureWithAvg } from "@/types";
import {
  buildMonthlyTableRows,
  formatMonthlyValue,
  getMonthlyTableRowLabel,
  getMonthlyTableVariables,
} from "@/utils/monthlyTable.util";
import { describe, expect, it } from "vitest";

const month = (i: number, values: Partial<TMonthlyTemperatureWithAvg>) => ({
  month: i + 1,
  monthName: `M${i + 1}`,
  tmin: 1,
  tmax: 9,
  tavg: 5,
  prec: 40,
  ...values,
});
const labels = { tmax: "Max", tavg: "Avg", tmin: "Min", prec: "Precip" };
const all = { tmax: true, tmin: true, tavg: true, prec: true };

describe("monthly table", () => {
  it("groups rows by variable, one per series, labelled by variable and series", () => {
    const rows = buildMonthlyTableRows({
      series: [
        { key: "a", label: "Madrid", data: [month(0, { tavg: 6.25 })] },
        { key: "b", label: "Lviv", data: [month(0, { tavg: -3.6 })] },
      ],
      variables: ["tavg", "prec"],
      labels,
      locale: "en",
    });
    expect(rows.map(getMonthlyTableRowLabel)).toEqual([
      "Avg (°C) — Madrid",
      "Avg (°C) — Lviv",
      "Precip (mm) — Madrid",
      "Precip (mm) — Lviv",
    ]);
    expect(rows.map((row) => row.values[0])).toEqual(["6.3", "-3.6", "40", "40"]);
  });

  it("labels a single series' rows by variable only", () => {
    const [row] = buildMonthlyTableRows({
      series: [{ key: "single", data: [month(0, {})] }],
      variables: ["prec"],
      labels,
      locale: "en",
    });
    expect(row && getMonthlyTableRowLabel(row)).toBe("Precip (mm)");
  });

  it("renders a missing value as —", () => {
    expect(formatMonthlyValue({ variable: "tmin", value: null, locale: "en" })).toBe(
      MISSING_VALUE_LABEL,
    );
    expect(formatMonthlyValue({ variable: "prec", value: 12.6, locale: "en" })).toBe("13");
  });

  it("lists WL's two variables in WL mode, the visible chips in standard mode", () => {
    expect(getMonthlyTableVariables({ chartMode: "walter-lieth", visible: all })).toEqual([
      "tavg",
      "prec",
    ]);
    expect(
      getMonthlyTableVariables({ chartMode: "standard", visible: { ...all, tavg: false } }),
    ).toEqual(["tmax", "tmin", "prec"]);
  });
});
