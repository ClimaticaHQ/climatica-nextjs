// @vitest-environment jsdom
import {
  ComparedPeriods,
  ComparedPeriodsSection,
} from "@/components/filters/sections/ComparedPeriods";
import { CLIMATE_PERIODS, FILTER_DEFAULTS } from "@/constants";
import { EFilterApplyMode } from "@/enums";
import messages from "@/i18n/locales/en.json";
import type { TClimatePeriodPair, TFilters } from "@/types";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const page = vi.hoisted(() => {
  const updates: { partial: unknown; mode: string }[] = [];
  const state: { filters: TFilters | null; updates: typeof updates } = {
    filters: null,
    updates,
  };
  return state;
});

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("@/hooks/filters/useFilters", () => ({
  useFilters: () => page.filters,
}));
vi.mock("@/hooks/filters/useFilterNavigation", () => ({
  useFilterNavigation: () => ({
    applyFilters: vi.fn(),
    updateFilters: (partial: unknown, mode: string) => page.updates.push({ partial, mode }),
  }),
}));
// * jsdom has no matchMedia: the years editor's parts ask for a breakpoint (below lg here)
vi.mock("@/hooks/ui/useMediaQuery", () => ({ useMediaQuery: () => false }));
vi.mock("@/hooks/filters/useCityClimatePeriods", () => ({
  useCityClimatePeriods: () => null,
}));

const PAIR: TClimatePeriodPair = {
  climatePeriodA: CLIMATE_PERIODS.C1970_2000,
  climatePeriodB: CLIMATE_PERIODS.C1991_2020,
};

afterEach(() => {
  cleanup();
  page.updates.length = 0;
});

function withIntl(node: ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>
  );
}

function renderPair(onChange = vi.fn()) {
  render(
    withIntl(
      <ComparedPeriodsSection
        values={{ ...FILTER_DEFAULTS, ...PAIR }}
        availablePeriods={null}
        onChange={vi.fn()}
        onChangeMany={onChange}
        isOnPage
      />,
    ),
  );
  return onChange;
}

const option = (side: "a" | "b", period: string) =>
  screen.getByTestId(`page-period-${side}-option-${period}`);

describe("ComparedPeriodsSection: the Climate A ↔ B pair", () => {
  it("disables each side's period in the other select", () => {
    renderPair();
    expect(option("a", PAIR.climatePeriodB).hasAttribute("disabled")).toBe(true);
    expect(option("b", PAIR.climatePeriodA).hasAttribute("disabled")).toBe(true);
    expect(option("a", CLIMATE_PERIODS.C1961_1990).hasAttribute("disabled")).toBe(false);
  });

  it("changes one side, keeping the other", () => {
    const onChange = renderPair();
    fireEvent.click(option("a", CLIMATE_PERIODS.C1961_1990));
    expect(onChange).toHaveBeenCalledWith({
      climatePeriodA: CLIMATE_PERIODS.C1961_1990,
      climatePeriodB: PAIR.climatePeriodB,
    });
  });

  it("swaps the two periods in one change", () => {
    const onChange = renderPair();
    fireEvent.click(screen.getByRole("button", { name: "Swap periods" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      climatePeriodA: PAIR.climatePeriodB,
      climatePeriodB: PAIR.climatePeriodA,
    });
  });

  it("names each select by its label and value", () => {
    renderPair();
    expect(screen.getByRole("button", { name: "Period A 1970–2000" })).toBeTruthy();
  });
});

describe("ComparedPeriods (the page, below lg)", () => {
  it("shows the period pair with Climate, applying changes with replace", () => {
    page.filters = { ...FILTER_DEFAULTS, ...PAIR };
    render(withIntl(<ComparedPeriods />));
    fireEvent.click(screen.getByRole("button", { name: "Swap periods" }));
    expect(page.updates).toEqual([
      {
        partial: { climatePeriodA: PAIR.climatePeriodB, climatePeriodB: PAIR.climatePeriodA },
        mode: EFilterApplyMode.QUICK,
      },
    ]);
  });

  it("falls back to the years editor with Weather", () => {
    page.filters = { ...FILTER_DEFAULTS, dataset: "weather", weatherPeriods: [2021, 1967] };
    render(withIntl(<ComparedPeriods />));
    expect(screen.queryByRole("button", { name: "Swap periods" })).toBeNull();
    expect(screen.getByRole("button", { name: "Add period" })).toBeTruthy();
    expect(screen.getByText("2021")).toBeTruthy();
  });

  it("is always rendered, hidden from lg by CSS alone (the sidebar's copy shows there)", () => {
    page.filters = { ...FILTER_DEFAULTS, ...PAIR };
    const { container } = render(withIntl(<ComparedPeriods />));
    expect(screen.getByRole("button", { name: "Swap periods" })).toBeTruthy();
    expect(container.firstElementChild?.className.split(" ")).toContain("lg:hidden");
    expect(screen.getByTestId("page-period-b-select")).toBeTruthy();
  });
});
