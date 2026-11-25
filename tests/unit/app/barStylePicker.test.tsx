// @vitest-environment jsdom
import {
  BAR_STYLE_PICKER_CLASSES as C,
  BAR_STYLE_PREVIEW,
} from "@/app/settings/_components/Settings.constant";
import { Settings } from "@/app/settings/_components/Settings";
import { OVERLAY_BAR_STYLES, PRECIP_BAR, SETTINGS_DEFAULTS } from "@/constants";
import messages from "@/i18n/locales/en.json";
import { useSettingsStore } from "@/stores/settingsStore";
import type { TBarStyle } from "@/types";
import { getBarShades, getOverlayBarLayout } from "@/utils";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/libs/actions/setLocale.action", () => ({ setLocale: vi.fn() }));

beforeEach(() => {
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
  useSettingsStore.setState({ ...SETTINGS_DEFAULTS });
});
afterEach(cleanup);

const { settings: text } = messages;
const NAMES = {
  plain: text.barStyleOptions.plain,
  shades: text.barStyleOptions.shades,
  hatch: text.barStyleOptions.hatch,
} satisfies Record<TBarStyle, string>;

function renderPage() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Settings />
    </NextIntlClientProvider>,
  );
  return screen.getByRole("radiogroup", { name: text.chartBarStyle });
}

const card = (style: TBarStyle) => screen.getByRole("radio", { name: NAMES[style] });
const classOf = (element: Element | null | undefined) => element?.getAttribute("class") ?? "";
const preview = (style: TBarStyle) =>
  card(style).querySelector(`svg[data-bar-style-preview="${style}"]`);
const previewFills = (style: TBarStyle) =>
  [...(preview(style)?.querySelectorAll("rect:not([data-bar-hatch])") ?? [])].map((rect) =>
    rect.getAttribute("fill"),
  );
const barXs = (style: TBarStyle) =>
  [...(preview(style)?.querySelectorAll("rect:not([data-bar-hatch])") ?? [])]
    .slice(0, 3)
    .map((rect) => Number(rect.getAttribute("x")));

describe("the Comparison bar style row", () => {
  it("is a radio group named by its row's label, three cards in order, plain selected by default", () => {
    const group = renderPage();
    const description = screen.getByText(text.descriptions.chartBarStyle);
    const radios = within(group).getAllByRole("radio");
    expect(radios).toEqual([card("plain"), card("shades"), card("hatch")]);
    expect(radios.map((radio) => radio.getAttribute("aria-checked"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    const [rowId, styleId] = card("hatch").getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(rowId).toBe(description.id);
    expect(document.getElementById(styleId ?? "")?.textContent).toBe(
      text.barStyleDescriptions.hatch,
    );
    expect(
      screen.getByText(text.barStyleDescriptions.hatch, { selector: "[hidden]" }),
    ).toBeTruthy();
  });

  it("each card previews its style: plain and hatch the semantic fills, shades a step per entity", () => {
    renderPage();
    for (const style of ["plain", "hatch"] as const) {
      expect(new Set(previewFills(style))).toEqual(new Set([PRECIP_BAR.HUMID, PRECIP_BAR.ARID]));
    }
    expect(previewFills("shades")).toEqual(
      expect.arrayContaining([0, 1, 2].map((place) => getBarShades(place).humid)),
    );
    expect(preview("plain")?.querySelectorAll("[data-bar-hatch]")).toHaveLength(0);
    expect(preview("shades")?.querySelectorAll("[data-bar-hatch]")).toHaveLength(0);
    expect(preview("hatch")?.querySelectorAll("[data-bar-hatch]")).toHaveLength(6);
    for (const style of ["plain", "shades", "hatch"] as const) {
      const { gap, minGap } = OVERLAY_BAR_STYLES[style];
      const plotWidth =
        BAR_STYLE_PREVIEW.WIDTH - BAR_STYLE_PREVIEW.PLOT.LEFT - BAR_STYLE_PREVIEW.PLOT.RIGHT;
      const layout = getOverlayBarLayout({
        plotWidth: (plotWidth / BAR_STYLE_PREVIEW.MONTHS.length) * 12,
        entityCount: 3,
        gap,
        minGap,
      });
      const [a = 0, b = 0] = barXs(style);
      expect(b - a).toBeCloseTo(layout.barSize + layout.gap);
    }
    expect(preview("plain")?.querySelectorAll("path")).toHaveLength(2);
  });

  it("the selected card: its thumbnail ringed, its name in primary", () => {
    renderPage();
    const parts = (style: TBarStyle) => ({
      thumb: classOf(preview(style)?.parentElement),
      name: classOf(within(card(style)).getByText(NAMES[style])),
    });
    expect(parts("plain").thumb).toContain(C.THUMB_SELECTED);
    expect(parts("plain").name).toBe(C.NAME_SELECTED);
    expect(parts("hatch").thumb).not.toContain(C.THUMB_SELECTED);
    expect(parts("hatch").name).toBe(C.NAME);
  });

  it("a click on a card selects it and saves the setting", () => {
    renderPage();
    fireEvent.click(card("shades"));
    expect(useSettingsStore.getState().chartBarStyle).toBe("shades");
    expect(card("shades").getAttribute("aria-checked")).toBe("true");
    expect(card("plain").getAttribute("aria-checked")).toBe("false");
  });

  it("the keyboard: one tab stop; the arrows move the selection and the focus, wrapping", () => {
    renderPage();
    expect(
      ["plain", "shades", "hatch"].map((style) =>
        card(style as TBarStyle).getAttribute("tabindex"),
      ),
    ).toEqual(["0", "-1", "-1"]);

    act(() => card("plain").focus());
    fireEvent.keyDown(card("plain"), { key: "ArrowRight" });
    expect(useSettingsStore.getState().chartBarStyle).toBe("shades");
    expect(document.activeElement).toBe(card("shades"));
    expect(card("shades").getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(card("shades"), { key: "ArrowDown" });
    expect(useSettingsStore.getState().chartBarStyle).toBe("hatch");
    fireEvent.keyDown(card("hatch"), { key: "ArrowRight" });
    expect(useSettingsStore.getState().chartBarStyle).toBe("plain");
    fireEvent.keyDown(card("plain"), { key: "ArrowLeft" });
    expect(useSettingsStore.getState().chartBarStyle).toBe("hatch");
    expect(document.activeElement).toBe(card("hatch"));
    fireEvent.keyDown(card("hatch"), { key: "Home" });
    expect(useSettingsStore.getState().chartBarStyle).toBe("plain");
    fireEvent.keyDown(card("plain"), { key: "End" });
    expect(useSettingsStore.getState().chartBarStyle).toBe("hatch");
    fireEvent.keyDown(card("hatch"), { key: "a" });
    expect(useSettingsStore.getState().chartBarStyle).toBe("hatch");
  });

  it("a visible focus ring on every card", () => {
    renderPage();
    expect(classOf(card("plain"))).toContain("focus-visible:outline-2");
  });
});
