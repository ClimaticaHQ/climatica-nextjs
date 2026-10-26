// @vitest-environment jsdom
import { ChartCard } from "@/components/charts/ChartCard";
import { getChartLegendItems, getSeriesKindRule } from "@/components/charts/charts.util";
import { BAR_STYLES } from "@/constants";
import { EChartBody, ECompareLayout, ELegendSwatch } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import messages from "@/i18n/locales/en.json";
import { useSettingsStore } from "@/stores";
import type {
  TBarStyle,
  TChartFeatures,
  TChartMode,
  TChartSeries,
  TVariable,
  TVisibleSeries,
} from "@/types";
import { deriveChartModel, getSwatchBarStyle } from "@/utils";
import { act, cleanup, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CITY_PAIR, weatherYears } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeAll(stubChartEnvironment);
afterEach(() => {
  cleanup();
  act(() => useSettingsStore.getState().setSetting("chartBarStyle", "plain"));
});

const noop = () => undefined;
const YEARS = weatherYears([2021, 1967, 1981, 2002, 1974]);
const WITH_PREC: readonly TVariable[] = ["tmax", "tmin", "prec"];
const NO_PREC: readonly TVariable[] = ["tmax", "tmin"];
const VISIBLE: TVisibleSeries = { tmax: true, tmin: true, tavg: false, prec: true };
const FEATURES: TChartFeatures = {
  title: { names: [], subtitle: null },
  difference: null,
  hasSidePickers: false,
  hasMonthBadge: false,
  hasRawExport: false,
  hiddenBlocks: [],
};

type TCardProps = {
  series: readonly TChartSeries[];
  mode: TChartMode;
  layout: ECompareLayout;
  variables?: readonly TVariable[];
};

function Card({ series, mode, layout, variables = WITH_PREC }: TCardProps) {
  return (
    <ChartCard
      model={useChartModel(series)}
      viewState={{
        mode,
        variables: [...variables],
        selectedMonths: null,
        layout: { value: layout, onChange: noop },
        shown: { value: series.map(({ id }) => id), onChange: noop },
      }}
      features={FEATURES}
    />
  );
}

const chipSwatches = (props: TCardProps, barStyle: TBarStyle) => {
  act(() => useSettingsStore.getState().setSetting("chartBarStyle", barStyle));
  const { container } = render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Card {...props} />
    </NextIntlClientProvider>,
  );
  const swatches = container.querySelectorAll("[data-toolbar-chips] [data-series-hatch]").length;
  // * every other icon in a chip is its shape (no chip is locked: every year is shown)
  const shapes = container.querySelectorAll(
    "[data-toolbar-chips] svg:not([data-series-hatch])",
  ).length;
  cleanup();
  return { swatches, shapes };
};

describe("the swatch rule (getSwatchBarStyle)", () => {
  const view = (mode: TChartMode, body: EChartBody, barStyle: TBarStyle, isPrecVisible = true) =>
    getSwatchBarStyle({ mode, body, barStyle, isPrecVisible });

  it("the setting's style only in the standard overlay with precipitation shown", () => {
    expect(view("standard", EChartBody.OVERLAY, "hatch")).toBe("hatch");
    expect(view("standard", EChartBody.OVERLAY, "shades")).toBe("shades");
    expect(view("standard", EChartBody.OVERLAY, "plain")).toBe("plain");
  });

  it("the shape alone everywhere else: Walter-Lieth, side by side, one series, no precipitation", () => {
    for (const barStyle of BAR_STYLES) {
      for (const body of Object.values(EChartBody)) {
        expect(view("walter-lieth", body, barStyle)).toBe("plain");
      }
      expect(view("standard", EChartBody.SPLIT, barStyle)).toBe("plain");
      expect(view("standard", EChartBody.SINGLE, barStyle)).toBe("plain");
      expect(view("standard", EChartBody.OVERLAY, barStyle, false)).toBe("plain");
    }
  });
});

describe("the chips follow the rule", () => {
  const overlay = (mode: TChartMode, variables?: readonly TVariable[]) => ({
    series: YEARS,
    mode,
    layout: ECompareLayout.OVERLAY,
    ...(variables ? { variables } : {}),
  });

  it("standard overlay, hatch or shades: each chip its swatch and its shape", () => {
    for (const barStyle of ["hatch", "shades"] as const) {
      expect(chipSwatches(overlay("standard"), barStyle)).toEqual({ swatches: 5, shapes: 5 });
    }
  });

  it("Walter-Lieth, whatever the bar style: the shapes alone", () => {
    for (const barStyle of BAR_STYLES) {
      expect(chipSwatches(overlay("walter-lieth"), barStyle).swatches).toBe(0);
    }
  });

  it("plain, or precipitation not shown: the shapes alone", () => {
    expect(chipSwatches(overlay("standard"), "plain").swatches).toBe(0);
    expect(chipSwatches(overlay("standard", NO_PREC), "hatch")).toEqual({ swatches: 0, shapes: 5 });
  });
});

describe("the legend and the values table follow the rule", () => {
  const entries = deriveChartModel(CITY_PAIR).series;
  const LABELS = {
    tmax: "",
    tmin: "",
    tavg: "",
    prec: "",
    temp: "",
    humid: "",
    arid: "",
    perhumid: "",
    frost: "",
  };
  const entityKinds = (mode: TChartMode, barStyle: TBarStyle, visible = VISIBLE) =>
    getChartLegendItems(
      {
        mode,
        body: EChartBody.OVERLAY,
        rule: getSeriesKindRule(CITY_PAIR),
        visible,
        activeMonth: { activeMonthIndex: null },
        shadedId: null,
        entries,
        isCompact: false,
        shownPanel: null,
        barStyle,
      },
      LABELS,
      [],
    )
      .filter(({ key }) => entries.some(({ series }) => series.id === key))
      .map(({ swatch }) => swatch.kind);

  it("the standard overlay with hatch: its entities' swatches; precipitation off: the shapes", () => {
    expect(entityKinds("standard", "hatch")).toEqual([ELegendSwatch.ENTITY, ELegendSwatch.ENTITY]);
    expect(entityKinds("standard", "hatch", { ...VISIBLE, prec: false })).toEqual([
      ELegendSwatch.MARKER,
      ELegendSwatch.MARKER,
    ]);
  });

  it("Walter-Lieth: the shapes, in every bar style", () => {
    for (const barStyle of BAR_STYLES) {
      expect(entityKinds("walter-lieth", barStyle)).toEqual([
        ELegendSwatch.MARKER,
        ELegendSwatch.MARKER,
      ]);
    }
  });

  it("the Walter-Lieth overlay's values table: no hatch in its mm row", () => {
    act(() => useSettingsStore.getState().setSetting("chartBarStyle", "hatch"));
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Card series={CITY_PAIR} mode="walter-lieth" layout={ECompareLayout.OVERLAY} />
      </NextIntlClientProvider>,
    );
    const table = container.querySelector('[data-chart-block="valuesTable"]');
    expect(table?.querySelectorAll("[data-series-shape]").length).toBeGreaterThan(0);
    expect(table?.querySelectorAll("[data-series-hatch]")).toHaveLength(0);
  });
});
