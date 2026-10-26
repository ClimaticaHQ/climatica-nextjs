// @vitest-environment jsdom
import { SeriesChips } from "@/components/charts/SeriesChips";
import messages from "@/i18n/locales/en.json";
import { SERIES_MARKER_COLOR } from "@/constants";
import { deriveChartModel, getMarkerPath } from "@/utils";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { weatherYears } from "./chartFixtures";
import { stubChartEnvironment } from "./chartTestEnv";

beforeAll(stubChartEnvironment);
afterEach(cleanup);

const ENTRIES = deriveChartModel(weatherYears([2021, 1990, 1967])).series;

function renderChips(shown: readonly string[]) {
  const onShownChange = vi.fn();
  const onHighlight = vi.fn();
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SeriesChips
        entries={ENTRIES}
        shown={shown}
        onShownChange={onShownChange}
        onHighlight={onHighlight}
      />
    </NextIntlClientProvider>,
  );
  return { onShownChange, onHighlight };
}

describe("SeriesChips", () => {
  it("toggles a series off and on", () => {
    const { onShownChange } = renderChips(["2021", "1990"]);
    fireEvent.click(screen.getByRole("button", { name: "1990" }));
    expect(onShownChange).toHaveBeenLastCalledWith(["2021"]);
    fireEvent.click(screen.getByRole("button", { name: "1967" }));
    expect(onShownChange).toHaveBeenLastCalledWith(["2021", "1990", "1967"]);
  });

  it("locks the last shown series — announced as disabled, no hint", () => {
    const { onShownChange } = renderChips(["1990"]);
    const last = screen.getByRole("button", { name: "1990" });
    expect(last.getAttribute("aria-disabled")).toBe("true");
    expect(last.className).toContain("cursor-not-allowed");
    expect(last.hasAttribute("aria-describedby")).toBe(false);
    fireEvent.click(last);
    expect(onShownChange).not.toHaveBeenCalled();
  });

  it("marks each chip with its series' shape in graphite — never a colour", () => {
    renderChips(["2021", "1990", "1967"]);
    const chip = screen.getByRole("button", { name: "1967" });
    expect(chip.getAttribute("style")).toBeNull();
    const marker = chip.querySelector("[aria-hidden='true']");
    expect(marker?.getAttribute("style")).toContain(`color: ${SERIES_MARKER_COLOR}`);
    // * 1967 is third in the list: the triangle
    expect(marker?.querySelector("svg:not([data-series-hatch]) path")?.getAttribute("d")).toBe(
      getMarkerPath({ shape: "triangle", cx: 7, cy: 7, size: 9 }),
    );
  });

  it("highlights the hovered or focused series", () => {
    const { onHighlight } = renderChips(["2021", "1990", "1967"]);
    const chip = screen.getByRole("button", { name: "1967" });
    fireEvent.mouseEnter(chip.parentElement ?? chip);
    expect(onHighlight).toHaveBeenLastCalledWith("1967");
    fireEvent.focus(chip);
    fireEvent.blur(chip);
    expect(onHighlight).toHaveBeenLastCalledWith(null);
  });
});
