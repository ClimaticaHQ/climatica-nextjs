// @vitest-environment jsdom
import { FixedYAxes } from "@/components/charts/FixedYAxes";
import { StandardChart } from "@/components/charts/StandardChart";
import { StandardChartAxes } from "@/components/charts/StandardChartAxes";
import { FIXED_Y_AXES } from "@/components/charts/charts.constant";
import type { TStandardChartEntry } from "@/components/charts/charts.type";
import { MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { SECTION_LABEL_TEXT } from "@/components/UI/SectionLabel/SectionLabel.constant";
import { MONTHLY_VALUES_HOVER } from "@/components/MonthlyValuesTable/MonthlyValuesTable.constant";
import { ChartFocusContext } from "@/components/charts/chartFocus.context";
import messages from "@/i18n/locales/en.json";
import { getPlotMargin, getUnitTitleFontSize, getUnitTitlePlacement } from "@/utils";
import { estimateTextWidth } from "@/utils/export/svg/textWrap.util";
import { cleanup, fireEvent, render, renderHook } from "@testing-library/react";
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

const YEARS = ["2021", "1967", "1990", "2010", "2000"];
const HOVERED = 5;
// * the plot's left axis area: the header column's width, the table frame's border given back
const AXIS = getPlotMargin(false);
const FRAME_BORDER = 1;

describe("the standard overlay's values table", () => {
  const months = (shift: number) =>
    Array.from({ length: 12 }, (_, i) => ({ tavg: i + shift, prec: 10 + i }));
  const series = [
    { key: "2021", label: "2021", data: months(0) },
    { key: "1967", label: "1967", data: months(-5) },
  ];
  const markers = [
    { shape: "circle", hatch: "solid", label: "2021", title: "2021" },
    { shape: "square", hatch: "diagonal", label: "1967", title: "1967" },
  ] as const;
  const renderTable = (onEntityFocus = vi.fn(), onActiveMonthIndexChange = vi.fn()) =>
    render(
      <ChartFocusContext.Provider value={{ focusedId: null, onEntityFocus }}>
        <MonthlyValuesTable
          series={series}
          markers={markers}
          hasSections
          isCompact={false}
          activeMonthIndex={null}
          onActiveMonthIndexChange={onActiveMonthIndexChange}
        />
      </ChartFocusContext.Provider>,
      { wrapper },
    );

  it("each unit a section label row over its group, in the header column only", () => {
    const { container } = renderTable();
    const rows = [...container.querySelectorAll("tbody tr")];
    expect(rows.map((row) => row.getAttribute("aria-hidden"))).toEqual([
      "true",
      null,
      "true",
      null,
    ]);
    expect(rows[0]?.querySelector("td")?.textContent).toBe("°C");
    expect(rows[2]?.querySelector("td")?.textContent).toBe("mm");
    // * a cell per month (the hovered month's band runs through it), all empty
    const cells = [...(rows[0]?.querySelectorAll("td") ?? [])];
    expect(cells).toHaveLength(1 + 12 + 1);
    expect(cells.slice(1).every((cell) => cell.textContent === "")).toBe(true);
  });

  it("rows are headed by short labels as text — no shapes or hatches — the name in the title", () => {
    const { container } = renderTable();
    const headers = [...container.querySelectorAll("tbody th [title]")];
    expect(headers.map((header) => header.textContent)).toEqual(["2021", "1967", "2021", "1967"]);
    expect(headers.map((header) => header.getAttribute("title"))).toEqual([
      "2021",
      "1967",
      "2021",
      "1967",
    ]);
    expect(container.querySelectorAll("tbody th svg, tbody th [data-series-shape]")).toHaveLength(
      0,
    );
    // * tabular numerals, the table's type
    expect(container.querySelector("tbody th > span")?.className).toContain("tabular-nums");
  });

  it("hovering or focusing a header focuses its entity — never a month", () => {
    const onEntityFocus = vi.fn();
    const onActiveMonthIndexChange = vi.fn();
    const { container } = renderTable(onEntityFocus, onActiveMonthIndexChange);
    const header = container.querySelectorAll("tbody th [title]")[1];
    if (!header) throw new Error("no header");
    fireEvent.mouseEnter(header);
    expect(onEntityFocus).toHaveBeenLastCalledWith("1967");
    fireEvent.mouseLeave(header);
    expect(onEntityFocus).toHaveBeenLastCalledWith(null);
    fireEvent.focus(header);
    expect(onEntityFocus).toHaveBeenLastCalledWith("1967");
    expect(onActiveMonthIndexChange).not.toHaveBeenCalled();
  });

  it("the hovered month: one band from the table's top edge to its bottom", () => {
    const { container } = render(
      <MonthlyValuesTable
        series={series}
        markers={markers}
        hasSections
        isCompact={false}
        activeMonthIndex={HOVERED}
      />,
      { wrapper },
    );
    const rows = [...container.querySelectorAll("tbody tr")];
    // * every row — section labels included — paints the month's cell (after the header cell)
    const cells = rows.map((row) => row.children[HOVERED + 1]);
    cells.forEach((cell) =>
      expect(cell?.getAttribute("style")).toContain(`background-color: ${MONTHLY_VALUES_HOVER}`),
    );
    // * the divider between the groups: the band's colour across the hovered month
    expect(cells[2]?.getAttribute("style")).toContain(`border-top-color: ${MONTHLY_VALUES_HOVER}`);
    expect(rows[2]?.children[HOVERED]?.getAttribute("style")).toBeNull();
  });

  it("the header column is the plot's left axis area", () => {
    const { container } = renderTable();
    expect(container.querySelector("col")?.getAttribute("style")).toContain(
      `width: ${AXIS - FRAME_BORDER}px`,
    );
  });

  it("values, headers and section labels in the app's shared type — no size of their own", () => {
    const { container } = renderTable();
    const value = container.querySelector("tbody td[tabindex]")?.className ?? "";
    const headerLines = container.querySelector("tbody th > span")?.className ?? "";
    const section = container.querySelector("tbody tr td")?.className ?? "";
    // * the stats table's size from a full chart's width; the headers' lines as tall as the values'
    for (const className of [value, headerLines]) {
      expect(className).toContain("text-[length:var(--font-sm)]");
      expect(className).toContain("text-[length:var(--font-xs)]");
    }
    expect(value).toContain("font-medium");
    expect(value).toContain("py-1");
    expect(section).toContain(SECTION_LABEL_TEXT);
    // * only token sizes: no px font size anywhere in the table
    expect(container.innerHTML).not.toMatch(/text-\[\d+px\]/);
  });
});

describe("the plot's margins are its axes'", () => {
  type TElementProps = Record<string, unknown> & { children?: ReactNode };
  // * every element in a tree, depth first
  const elementsOf = (node: unknown): unknown[] => {
    if (Array.isArray(node)) return node.flatMap(elementsOf);
    if (!isValidElement<TElementProps>(node)) return [];
    return [node, ...elementsOf(node.props.children)];
  };
  const entry = (id: string): TStandardChartEntry => ({
    id,
    label: id,
    aridityByMonth: undefined,
    hatch: "solid",
    isHidden: false,
    marker: { shape: "circle" },
  });

  it("the plot keeps the axes' own width; scrolling, only the fixed axes draw °C and mm", () => {
    const { result } = renderHook(
      () =>
        StandardChart({
          entries: YEARS.map(entry),
          rows: [],
          hasMeanLine: false,
          scales: null,
          rightMax: 100,
          visible: { tmax: true, tmin: true, tavg: false, prec: true },
          highlightedId: null,
          activeMonth: { activeMonthIndex: null },
          footer: null,
        }),
      { wrapper },
    );
    // * no width measured yet: laid out at the minimum and scrolling, the fixed axes shown
    const types = elementsOf(result.current).flatMap((element) =>
      isValidElement(element) ? [element.type] : [],
    );
    expect(types).toContain(FixedYAxes);
    // * scrolling: only the fixed axes draw °C and mm — the plot's own would slide out under them
    const axes = elementsOf(result.current).find(
      (element) => isValidElement(element) && element.type === StandardChartAxes,
    );
    expect(isValidElement<TElementProps>(axes) && axes.props["shouldShowUnitTitles"]).toBe(false);
  });
});

describe("the unit titles stay inside their charts", () => {
  const CHART_WIDTH = 400;
  const titleWidth = (text: string, isCompact: boolean) =>
    estimateTextWidth(text, getUnitTitleFontSize(isCompact));

  it("°C starts at the left axis, mm ends at the right one: never past the chart's edges", () => {
    for (const isCompact of [false, true]) {
      const left = getUnitTitlePlacement({ side: "left", chartWidth: CHART_WIDTH, isCompact });
      const right = getUnitTitlePlacement({ side: "right", chartWidth: CHART_WIDTH, isCompact });
      expect(left).toMatchObject({ textAnchor: "start", x: getPlotMargin(isCompact) });
      expect(right).toMatchObject({ textAnchor: "end" });
      expect(right.x - titleWidth("mm", isCompact)).toBeGreaterThanOrEqual(0);
      expect(right.x).toBeLessThanOrEqual(CHART_WIDTH);
    }
  });

  it("a fixed axis' frame holds its whole title beside the axis", () => {
    expect(titleWidth("°C", false)).toBeLessThanOrEqual(FIXED_Y_AXES.TITLE_ROOM);
    expect(titleWidth("mm", false)).toBeLessThanOrEqual(
      getPlotMargin(false) + FIXED_Y_AXES.TITLE_ROOM,
    );
  });
});
