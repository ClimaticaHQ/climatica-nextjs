import { CHART_PLOT, MISSING_VALUE_LABEL } from "@/constants";
import { getAxisStyle, getMonthlyValuesColumns } from "@/utils/chartAxis.util";
import { buildMonthlyValuesRows, formatMonthlyValuesValue } from "@/utils/monthlyValues.util";
import { describe, expect, it } from "vitest";

const palette = { temp: "red", prec: "blue" };
const names = { tavg: "Mean temperature", prec: "Precipitation" };
const months = (tavg: number, prec: number) =>
  Array.from({ length: 12 }, (_, i) => ({ tavg: tavg - i, prec: prec + i }));

describe("monthly values table geometry", () => {
  it.each([false, true])(
    "puts each column's centre on its month's position in the plot (compact: %s)",
    (isCompact) => {
      const tableWidth = 812;
      const { margin, centers } = getMonthlyValuesColumns({ tableWidth, isCompact });
      // * the plot: its y axes either side, 12 equal month bands between, month i at its centre
      const axis = getAxisStyle(isCompact).width + CHART_PLOT.MARGIN.left;
      const plotWidth = tableWidth - axis * 2;
      expect(margin).toBe(axis);
      centers.forEach((x, i) => expect(x).toBeCloseTo(axis + (plotWidth / 12) * (i + 0.5), 9));
    },
  );
});

describe("monthly values rows", () => {
  it("has exactly two rows — °C (red) and mm (blue) — twelve cells each", () => {
    const rows = buildMonthlyValuesRows({
      series: [{ key: "a", label: "Lviv", color: "ink", data: months(4, 36) }],
      palette,
      names,
      locale: "en",
    });
    expect(rows.map(({ unit, unitColor }) => [unit, unitColor])).toEqual([
      ["°C", "red"],
      ["mm", "blue"],
    ]);
    expect(rows.map(({ cells }) => cells.length)).toEqual([12, 12]);
  });

  it("formats temperatures to one decimal with a real minus, precipitation whole, — if missing", () => {
    const format = (variable: "tavg" | "prec", value: number | null, locale = "en") =>
      formatMonthlyValuesValue({ variable, value, locale });
    expect(format("tavg", -3.64)).toBe("−3.6");
    expect(format("tavg", 4)).toBe("4.0");
    expect(format("prec", 36.6)).toBe("37");
    expect(format("prec", null)).toBe(MISSING_VALUE_LABEL);
    // * the UI's locale: a decimal comma
    expect(format("tavg", -3.64, "es")).toBe("−3,6");
  });

  it("overlay: stacks A's value above B's in each cell, in their colors, each named", () => {
    const [temp] = buildMonthlyValuesRows({
      series: [
        { key: "a", label: "Valladolid", color: "green", data: months(4, 44) },
        { key: "b", label: "Lviv", color: "orange", data: months(-3.6, 37) },
      ],
      palette,
      names,
      locale: "en",
    });
    expect(temp?.cells[0]).toEqual([
      { text: "4.0", color: "green", srText: "Valladolid: 4.0" },
      { text: "−3.6", color: "orange", srText: "Lviv: −3.6" },
    ]);
  });
});
