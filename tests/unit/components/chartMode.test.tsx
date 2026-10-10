// @vitest-environment jsdom
import { ChartModeSwitch } from "@/components/ChartModeSwitch";
import { FilterSection } from "@/components/filters/FilterSection";
import { FilterUnavailableActionsContext } from "@/components/filters/filters.context";
import { EFilterAvailability } from "@/enums";
import messages from "@/i18n/locales/en.json";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const url = vi.hoisted(() => {
  const writes: string[] = [];
  return { writes };
});

vi.mock("@/hooks/url/useChartModeUrl", () => ({
  useChartModeUrl: () => ({
    chartMode: "walter-lieth",
    setChartMode: (mode: string) => url.writes.push(mode),
  }),
}));

beforeAll(() => {
  // * the segmented control measures its active option
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
  url.writes.length = 0;
});

function withIntl(node: ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>
  );
}

describe("ChartModeSwitch", () => {
  it("writes the chosen mode to the URL", () => {
    render(withIntl(<ChartModeSwitch value="walter-lieth" />));
    fireEvent.click(screen.getByRole("button", { name: "Standard chart" }));
    expect(url.writes).toEqual(["standard"]);
  });

  it("is always usable — no disabled state, no hint", () => {
    render(withIntl(<ChartModeSwitch value="walter-lieth" />));
    const walterLieth = screen.getByRole("button", { name: "Walter-Lieth diagram" });
    expect(walterLieth.getAttribute("aria-disabled")).toBeNull();
    expect(walterLieth.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Standard chart" }));
    fireEvent.click(walterLieth);
    expect(url.writes).toEqual(["standard", "walter-lieth"]);
  });
});

describe("FilterSection: why a filter is unavailable", () => {
  it("shows the note alone outside a provider", () => {
    render(
      withIntl(
        <FilterSection availability={EFilterAvailability.WALTER_LIETH}>
          <span />
        </FilterSection>,
      ),
    );
    expect(screen.getByText("Not available in Walter-Lieth view")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("offers the way out where one is provided", () => {
    const onSwitch = vi.fn();
    render(
      withIntl(
        <FilterUnavailableActionsContext.Provider
          value={{ [EFilterAvailability.WALTER_LIETH]: onSwitch }}
        >
          <FilterSection availability={EFilterAvailability.WALTER_LIETH}>
            <span />
          </FilterSection>
          <FilterSection availability={EFilterAvailability.HEAT_MAP}>
            <span />
          </FilterSection>
        </FilterUnavailableActionsContext.Provider>,
      ),
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Switch to standard chart" }));
    expect(onSwitch).toHaveBeenCalledTimes(1);
  });
});
