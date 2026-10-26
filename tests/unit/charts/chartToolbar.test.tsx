// @vitest-environment jsdom
import { ChartCard } from "@/components/charts/ChartCard";
import { ECompareLayout } from "@/enums";
import { useChartModel } from "@/hooks/charts/useChartModel";
import messages from "@/i18n/locales/en.json";
import type { TChartFeatures, TChartMode, TChartSeries } from "@/types";
import { cleanup, render, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CITY, weatherYears } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const noop = () => undefined;
const YEARS = weatherYears([2021, 1967, 1990, 2010, 2000]);
const FEATURES: TChartFeatures = {
  title: { names: [], subtitle: "Weather" },
  difference: null,
  hasSidePickers: false,
  hasMonthBadge: false,
  hasRawExport: false,
  hiddenBlocks: [],
};

type TCardProps = {
  series: readonly TChartSeries[];
  mode: TChartMode;
  layout?: ECompareLayout;
};

function Card({ series, mode, layout }: TCardProps) {
  const model = useChartModel(series);
  return (
    <ChartCard
      model={model}
      viewState={{
        mode,
        variables: ["tmax", "tmin", "prec"],
        selectedMonths: null,
        ...(layout !== undefined ? { layout: { value: layout, onChange: noop } } : {}),
        ...(series.length > 2
          ? { shown: { value: series.map(({ id }) => id), onChange: noop } }
          : {}),
      }}
      features={FEATURES}
    />
  );
}

function renderToolbar(props: TCardProps) {
  const { container } = render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Card {...props} />
    </NextIntlClientProvider>,
  );
  const toolbars = container.querySelectorAll("[data-chart-controls]");
  const [toolbar] = toolbars;
  if (!(toolbar instanceof HTMLElement)) throw new Error("no toolbar");
  return {
    count: toolbars.length,
    chips: toolbar.querySelector<HTMLElement>("[data-toolbar-chips]"),
    controls: toolbar.querySelector<HTMLElement>("[data-toolbar-controls]"),
  };
}

const GUIDE = messages.chart.wlGuideButton;
const MAX_TEMP = messages.sidebar.variables.tmax;

describe("the chart toolbar: one row in every view", () => {
  it("standard overlay: the year chips on the left, the variable chips on the right", () => {
    const { count, chips, controls } = renderToolbar({
      series: YEARS,
      mode: "standard",
      layout: ECompareLayout.OVERLAY,
    });
    expect(count).toBe(1);
    expect(within(chips!).getByRole("group", { name: messages.chart.yearsShown })).toBeTruthy();
    expect(within(controls!).getByRole("button", { name: MAX_TEMP })).toBeTruthy();
    expect(within(controls!).queryByRole("button", { name: GUIDE })).toBeNull();
  });

  it("Walter-Lieth overlay: the same chips on the left, the guide on the right", () => {
    const { count, chips, controls } = renderToolbar({
      series: YEARS,
      mode: "walter-lieth",
      layout: ECompareLayout.OVERLAY,
    });
    expect(count).toBe(1);
    expect(within(chips!).getByRole("group", { name: messages.chart.yearsShown })).toBeTruthy();
    expect(within(controls!).getByRole("button", { name: GUIDE })).toBeTruthy();
    expect(within(controls!).queryByRole("button", { name: MAX_TEMP })).toBeNull();
  });

  it("without entity chips (one city, side by side): the controls alone", () => {
    for (const props of [
      { series: [CITY], mode: "walter-lieth" as const },
      { series: YEARS, mode: "standard" as const, layout: ECompareLayout.SPLIT },
    ]) {
      const { count, chips, controls } = renderToolbar(props);
      expect(count).toBe(1);
      expect(chips).toBeNull();
      expect(controls).not.toBeNull();
      cleanup();
    }
  });
});
