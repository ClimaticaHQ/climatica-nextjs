// @vitest-environment jsdom
import { EXPORT_BAR_STYLE } from "@/constants";
import { ECompareLayout } from "@/enums";
import { useComparisonChartExport } from "@/hooks/charts/useComparisonChartExport";
import messages from "@/i18n/locales/en.json";
import { useSettingsStore } from "@/stores";
import type { TBarStyle, TChartFeatures, TCompareExportPayload } from "@/types";
import { deriveChartModel } from "@/utils";
import { act, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CITY_PAIR, weatherYears } from "../charts/chartFixtures";

// * the payload each export builds, captured before any file is drawn or saved
const built = vi.hoisted(() => ({ payloads: [] as TCompareExportPayload[] }));

vi.mock("@/utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/utils")>();
  return {
    ...original,
    buildCompareExportSvg: (payload: TCompareExportPayload) => {
      built.payloads.push(payload);
      return { svg: "<svg />", height: 1 };
    },
    downloadSvgString: vi.fn(),
    resolveExportColors: vi.fn(),
  };
});

beforeEach(() => {
  built.payloads = [];
});
afterEach(() => {
  act(() => useSettingsStore.getState().setSetting("chartBarStyle", "plain"));
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);
const FEATURES: TChartFeatures = {
  title: { names: ["Valladolid"], subtitle: "Weather" },
  difference: null,
  hasSidePickers: false,
  hasMonthBadge: false,
  hasRawExport: false,
  hiddenBlocks: [],
};

function renderExport(series: Parameters<typeof deriveChartModel>[0]) {
  return renderHook(
    () =>
      useComparisonChartExport({
        model: deriveChartModel(series),
        viewState: {
          mode: "standard",
          variables: ["tmax", "tmin", "prec"],
          selectedMonths: null,
          layout: { value: ECompareLayout.OVERLAY, onChange: vi.fn() },
        },
        features: FEATURES,
        visible: null,
        fileStem: "compare",
        datasetAttribution: null,
        shareUrl: "https://example.test",
        isFetching: false,
      }),
    { wrapper },
  );
}

const exportedStyle = (menu: { onExportSVG?: (() => void) | undefined }) => {
  menu.onExportSVG?.();
  return built.payloads.at(-1)?.barStyle;
};

describe("the comparison export: always the default bar style, the best for print", () => {
  it.each([
    ["Compare Cities", CITY_PAIR],
    ["Compare Periods (weather years)", weatherYears([2021, 1967, 1981])],
  ] as const)("%s: the payload is plain by default", (_name, series) => {
    const { result } = renderExport(series);
    expect(exportedStyle(result.current)).toBe("plain");
    expect(EXPORT_BAR_STYLE).toBe("plain");
  });

  it("whatever the setting — set before or while the page is open — the export stays plain", () => {
    act(() => useSettingsStore.getState().setSetting("chartBarStyle", "hatch"));
    const { result } = renderExport(weatherYears([2021, 1967, 1981]));
    expect(exportedStyle(result.current)).toBe("plain");
    for (const barStyle of ["shades", "hatch", "plain"] satisfies TBarStyle[]) {
      act(() => useSettingsStore.getState().setSetting("chartBarStyle", barStyle));
      expect(exportedStyle(result.current)).toBe("plain");
    }
  });

  it("each series keeps its place among every series", () => {
    const { result } = renderExport(weatherYears([2021, 1967, 1981]));
    result.current.onExportSVG?.();
    expect(built.payloads.at(-1)?.series.map(({ place }) => place)).toEqual([0, 1, 2]);
  });

  it("the page's order, each series with its own marker slot (not its place in the order)", () => {
    // * newest first, as the page lists them; 1967 keeps the slot it was added with
    const [y2021, y1967, y1981] = weatherYears([2021, 1967, 1981]);
    const { result } = renderExport([y2021!, y1981!, y1967!]);
    result.current.onExportSVG?.();
    expect(
      built.payloads.at(-1)?.series.map(({ label, place, shape }) => [label, place, shape]),
    ).toEqual([
      ["2021", 0, "circle"],
      ["1981", 2, "triangle"],
      ["1967", 1, "square"],
    ]);
  });
});
