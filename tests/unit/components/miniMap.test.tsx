// @vitest-environment jsdom
import { MiniMap } from "@/components/UI/MiniMap/MiniMap";
import type { TMiniMapLocation } from "@/components/UI";
import messages from "@/i18n/locales/en.json";
import { getMarkerPath } from "@/utils/seriesShape.util";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const BOLZANO: TMiniMapLocation = { lat: 46.4983, lng: 11.3548, label: "Bolzano", shape: "circle" };
const VERONA: TMiniMapLocation = { lat: 45.4384, lng: 10.9916, label: "Verona", shape: "square" };
const MARKER_ICON = { CENTRE: 7, SHAPE: 9 };
const LONG_NAME = "Valladolid de los Caballeros del Norte";

beforeEach(() => {
  // * the segmented control's pill reads the motion preference; jsdom has no matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
afterEach(cleanup);

const renderMap = (locations: TMiniMapLocation[], activeIndex = 0, onToggle = vi.fn()) => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MiniMap locations={locations} activeIndex={activeIndex} onToggle={onToggle} />
    </NextIntlClientProvider>,
  );
  return onToggle;
};
const toggle = () => screen.getByRole("group", { name: messages.map.highlightedPlace });

describe("the MiniMap's place toggle", () => {
  it("is the shared segmented control: one pressed option per place", () => {
    renderMap([BOLZANO, VERONA], 1);
    const options = within(toggle()).getAllByRole("button");
    expect(options.map((option) => option.getAttribute("aria-label"))).toEqual([
      "Bolzano",
      "Verona",
    ]);
    expect(options.map((option) => option.getAttribute("aria-pressed"))).toEqual(["false", "true"]);
  });

  it("reports the chosen place's index", () => {
    const onToggle = renderMap([BOLZANO, VERONA], 0);
    fireEvent.click(within(toggle()).getByRole("button", { name: "Verona" }));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it("shows each place's series marker, as in the legend, before its name", () => {
    renderMap([BOLZANO, VERONA]);
    const paths = within(toggle())
      .getAllByRole("button")
      .map((option) => option.querySelector("svg path")?.getAttribute("d"));
    // * OptionMarker's SeriesMarkerIcon: a 9px shape centred in 14px
    const shapeOf = (shape: "circle" | "square") =>
      getMarkerPath({
        shape,
        cx: MARKER_ICON.CENTRE,
        cy: MARKER_ICON.CENTRE,
        size: MARKER_ICON.SHAPE,
      });
    expect(paths).toEqual([shapeOf("circle"), shapeOf("square")]);
  });

  it("cuts a long name, keeping it whole as the option's name and title", () => {
    renderMap([{ ...BOLZANO, label: LONG_NAME }, VERONA]);
    const option = within(toggle()).getByRole("button", { name: LONG_NAME });
    expect(option.getAttribute("title")).toBe(LONG_NAME);
    expect(within(option).getByText(LONG_NAME).getAttribute("class")).toContain("truncate");
  });

  it("is absent for a single place", () => {
    renderMap([BOLZANO]);
    expect(screen.queryByRole("group")).toBeNull();
  });
});
