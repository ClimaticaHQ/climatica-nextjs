// @vitest-environment jsdom
import { ChartFocusContext } from "@/components/charts/chartFocus.context";
import { OverlayBars } from "@/components/charts/OverlayBars";
import { OverlayCurves } from "@/components/charts/OverlayCurves";
import {
  CHART_COLORS,
  STANDARD_CHART_LINES,
  STANDARD_CHART_SINGLE_COLORS,
} from "@/components/charts/charts.constant";
import type { TStandardChartEntry } from "@/components/charts/charts.type";
import { MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { FOCUS_CONTEXT, OVERLAY_FOCUS } from "@/constants";
import messages from "@/i18n/locales/en.json";
import type { TExportChartColors } from "@/types";
import { buildMonthlyTableSvg } from "@/utils/export/svg/monthlyTableExport.util";
import { cleanup, render, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { isValidElement, type ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { stubChartEnvironment } from "./chartTestEnv";

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

const entry = (id: string, shape: "circle" | "square" | "triangle", isHidden = false) =>
  ({
    id,
    label: id,
    aridityByMonth: { 1: true },
    hatch: shape === "circle" ? "solid" : "diagonal",
    isHidden,
    marker: { shape },
  }) satisfies TStandardChartEntry;
const ENTRIES = [entry("2021", "circle"), entry("1967", "square"), entry("1990", "triangle", true)];
const VISIBLE = { tmax: true, tmin: true, tavg: false, prec: true };
const shared = {
  entries: ENTRIES,
  visible: VISIBLE,
  activeMonthIndex: null,
  focusedId: "1967",
  onFocus: vi.fn(),
};

type TElementProps = Record<string, unknown>;
const propsOf = (element: unknown): TElementProps =>
  isValidElement<TElementProps>(element) ? element.props : {};
const keyOf = (element: unknown) => (isValidElement(element) ? String(element.key) : "");

function curves() {
  const { result } = renderHook(
    () =>
      OverlayCurves({
        ...shared,
        lines: STANDARD_CHART_LINES,
        hidden: { tmax: false, tmin: false, tavg: false },
        offsets: { "2021": -0.2, "1967": 0.2 },
      }),
    { wrapper },
  );
  return result.current;
}

describe("focus: the context turns gray", () => {
  it("context curves: one gray, thin, no points; the focused entity's: semantic, thicker", () => {
    const elements = curves();
    const line = (key: string) => propsOf(elements.find((e) => keyOf(e) === key));
    expect(line("2021-tmax")).toMatchObject({
      stroke: FOCUS_CONTEXT.LINE,
      strokeWidth: OVERLAY_FOCUS.CONTEXT_STROKE_WIDTH,
      dot: false,
      activeDot: false,
    });
    // * the line style stays: the min curve keeps its dots' dash
    expect(line("2021-tmin")["strokeDasharray"]).toBe(STANDARD_CHART_LINES[2]?.dash);
    expect(line("1967-tmax")).toMatchObject({
      stroke: STANDARD_CHART_SINGLE_COLORS.tmax,
      strokeWidth: OVERLAY_FOCUS.FOCUSED_STROKE_WIDTH,
    });
    expect(line("1967-tmax")["dot"]).toBeTypeOf("function");
  });

  it("the focused entity is drawn last, on top", () => {
    const keys = curves()
      .map(keyOf)
      .filter((key) => key.endsWith("-tmax"));
    expect(keys.at(-1)).toBe("1967-tmax");
  });

  it("a hidden entity stays hidden — never drawn as gray", () => {
    const hidden = curves().filter(
      (e) => keyOf(e).startsWith("1990-") && !keyOf(e).endsWith("-hit"),
    );
    expect(hidden.every((e) => propsOf(e)["hide"] === true)).toBe(true);
  });

  it("each entity's points ride its own x axis, offset to its bar's centre", () => {
    const axis = propsOf(curves().find((e) => keyOf(e) === "curve-1967"));
    const dataKey = axis["dataKey"];
    expect(typeof dataKey === "function" && dataKey({ month: 7 })).toBeCloseTo(6.2);
  });

  it("context bars: the light gray, no hatch; the focused entity's keep fill and hatch", () => {
    const { result } = renderHook(
      () => OverlayBars({ ...shared, isHidden: false, hasHatch: true, patternPrefix: "p" }),
      { wrapper },
    );
    const bars = result.current;
    const bar = (id: string) => propsOf(bars.find((e) => keyOf(e) === `${id}-prec`));
    expect(bar("2021")["fill"]).toBe(FOCUS_CONTEXT.BAR);
    expect(propsOf(bar("2021")["shape"])["hatchFill"]).toBeUndefined();
    expect(propsOf(bar("2021")["shape"])["aridityByMonth"]).toBeUndefined();
    expect(bar("1967")["fill"]).toBe(CHART_COLORS.humid);
    expect(propsOf(bar("1967")["shape"])["hatchFill"]).toBe("url(#p-diagonal)");
    expect(bar("1990")["hide"]).toBe(true);
  });
});

describe("the values table under a focus", () => {
  const months = (shift: number) =>
    Array.from({ length: 12 }, (_, i) => ({ tavg: i + shift, prec: 10 + i }));
  const series = [
    { key: "valladolid", label: "Valladolid de los Caballeros", data: months(0) },
    { key: "oslo", label: "Oslo", data: months(-5) },
  ];
  const markers = [
    { shape: "circle", hatch: "solid", label: "VAL", title: series[0]!.label },
    { shape: "square", hatch: "diagonal", label: "OSL", title: "Oslo" },
  ] as const;

  function renderTable(focusedId: string | null) {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ChartFocusContext.Provider value={{ focusedId, onEntityFocus: vi.fn() }}>
          <MonthlyValuesTable
            series={series}
            markers={markers}
            hasSections
            isCompact={false}
            activeMonthIndex={null}
          />
        </ChartFocusContext.Provider>
      </NextIntlClientProvider>,
    );
  }

  it("each header carries its series' full name in its title", () => {
    const { container } = renderTable(null);
    const headers = [...container.querySelectorAll("tbody th [title]")];
    expect(headers.map((header) => header.getAttribute("title"))).toEqual([
      "Valladolid de los Caballeros",
      "Oslo",
      "Valladolid de los Caballeros",
      "Oslo",
    ]);
    expect(headers.map((header) => header.textContent)).toEqual(["VAL", "OSL", "VAL", "OSL"]);
  });

  it("another series focused: this one's values muted, the focused one's not", () => {
    const { container } = renderTable("oslo");
    const [first, second] = [...container.querySelectorAll("tbody td[tabindex] > span > span")];
    expect(first?.getAttribute("style")).toContain(FOCUS_CONTEXT.TEXT);
    expect(second?.getAttribute("style")).not.toContain(FOCUS_CONTEXT.TEXT);
  });

  it("another series focused: its headers muted like its values", () => {
    const { container } = renderTable("oslo");
    const [muted, focused] = [...container.querySelectorAll("tbody th [title]")];
    expect(muted?.getAttribute("style")).toContain(FOCUS_CONTEXT.TEXT);
    expect(focused?.getAttribute("style")).toBeNull();
  });
});

const COLORS: TExportChartColors = {
  text: "#000",
  textSecondary: "#666",
  border: "#ccc",
  bg: "#fff",
  bgSecondary: "#f5f5f5",
  tmax: "#f00",
  tmin: "#00f",
  tavg: "#f80",
  arid: "#fc0",
  humid: "#9cf",
  brand: "#22a274",
  wlTemp: "#dc2626",
  wlPrec: "#2563eb",
  wlHumidHatch: "#2563eb",
  wlAridHatch: "#dc2626",
  wlCompressedFill: "#1d4ed8",
  wlFrost: "#4682b4",
  wlFrostOutline: "#6b7280",
  seriesMarker: "#555555",
};

describe("the export's monthly table", () => {
  it("a precipitation row shows its series' hatch beside its shape", () => {
    const { svg } = buildMonthlyTableSvg({
      rows: [
        {
          key: "p",
          variable: "prec",
          variableLabel: "Precip",
          unit: "mm",
          seriesLabel: "1967",
          marker: { shape: "square", hatch: "diagonal", color: "#555" },
          values: Array.from({ length: 12 }, () => "10"),
        },
        {
          key: "t",
          variable: "tmax",
          variableLabel: "Max Temp",
          unit: "°C",
          seriesLabel: "1967",
          marker: { shape: "square", hatch: "diagonal", color: "#555" },
          values: Array.from({ length: 12 }, () => "10"),
        },
      ],
      monthNames: Array.from({ length: 12 }, (_, i) => `M${i}`),
      top: 0,
      left: 0,
      width: 900,
      colors: COLORS,
    });
    expect(svg).toContain('<pattern id="tbl-hatch-diagonal"');
    expect(svg.match(/fill="url\(#tbl-hatch-diagonal\)"/g)).toHaveLength(1);
  });
});
