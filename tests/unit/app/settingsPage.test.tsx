// @vitest-environment jsdom
import { Settings } from "@/app/settings/_components/Settings";
import { SETTINGS_DESCRIPTION_IDS } from "@/app/settings/_components/Settings.constant";
import { SETTINGS_DEFAULTS } from "@/constants";
import { ETextSize } from "@/enums";
import messages from "@/i18n/locales/en.json";
import { useSettingsStore } from "@/stores/settingsStore";
import { act, cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/libs/actions/setLocale.action", () => ({ setLocale: vi.fn() }));

const device = vi.hoisted(() => ({ isReducedMotion: false, listeners: new Set<() => void>() }));

function setReducedMotion(isReducedMotion: boolean) {
  device.isReducedMotion = isReducedMotion;
  act(() => device.listeners.forEach((listener) => listener()));
}

beforeEach(() => {
  device.isReducedMotion = false;
  device.listeners.clear();
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return query.includes("reduce") && device.isReducedMotion;
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => device.listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => device.listeners.delete(listener),
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

function renderPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <Settings />
    </NextIntlClientProvider>,
  );
}

const animationsSwitch = () =>
  screen.getByRole("checkbox", { name: new RegExp(`^${text.animations}`) });
const isAnimationsChecked = () => {
  const input = animationsSwitch();
  return input instanceof HTMLInputElement && input.checked;
};
const highlightOptions = () => [
  screen.getByRole("button", { name: text.updateHighlightGlow }),
  screen.getByRole("button", { name: text.updateHighlightBorder }),
];
const highlightDescription = () =>
  document.getElementById(SETTINGS_DESCRIPTION_IDS.UPDATE_HIGHLIGHT)?.textContent ?? "";
const animationsDescription = () =>
  document.getElementById(animationsSwitch().getAttribute("aria-describedby") ?? "")?.textContent ??
  "";

describe("Settings page: Update highlight depends on Animations", () => {
  it("is enabled while animations are on, described by its own row", () => {
    renderPage();
    expect(highlightOptions().every((option) => !option.hasAttribute("disabled"))).toBe(true);
    expect(highlightDescription()).toBe(text.descriptions.updateHighlight);
    expect(
      highlightOptions().every(
        (option) =>
          option.getAttribute("aria-describedby") === SETTINGS_DESCRIPTION_IDS.UPDATE_HIGHLIGHT,
      ),
    ).toBe(true);
  });

  it("stays rendered but disabled when animations are off, the hint as its description", () => {
    useSettingsStore.setState({ animationsEnabled: false });
    renderPage();
    expect(highlightOptions().every((option) => option.hasAttribute("disabled"))).toBe(true);
    expect(highlightDescription()).toBe(text.hints.turnOnAnimations);
  });

  it("turning animations off disables it in place", () => {
    renderPage();
    act(() => animationsSwitch().click());
    expect(useSettingsStore.getState().animationsEnabled).toBe(false);
    expect(highlightOptions().every((option) => option.hasAttribute("disabled"))).toBe(true);
  });
});

describe("Settings page under the device's reduced motion", () => {
  it("disables both controls, shows animations as off and says why", () => {
    device.isReducedMotion = true;
    renderPage();
    expect(animationsSwitch().hasAttribute("disabled")).toBe(true);
    expect(isAnimationsChecked()).toBe(false);
    expect(animationsDescription()).toBe(text.reducedMotionNotice);
    expect(highlightOptions().every((option) => option.hasAttribute("disabled"))).toBe(true);
    expect(highlightDescription()).toBe(text.descriptions.updateHighlight);
    expect(useSettingsStore.getState().animationsEnabled).toBe(true);
  });

  it("reacts live when the device's setting changes", () => {
    renderPage();
    expect(animationsSwitch().hasAttribute("disabled")).toBe(false);

    setReducedMotion(true);
    expect(animationsSwitch().hasAttribute("disabled")).toBe(true);
    expect(animationsDescription()).toBe(text.reducedMotionNotice);
    expect(highlightOptions().every((option) => option.hasAttribute("disabled"))).toBe(true);

    setReducedMotion(false);
    expect(isAnimationsChecked()).toBe(true);
    expect(highlightOptions().every((option) => !option.hasAttribute("disabled"))).toBe(true);
    expect(animationsDescription()).toBe(text.descriptions.animations);
  });
});

describe("Settings page: the text size row", () => {
  it("is described by the applied step's name", () => {
    useSettingsStore.setState({ textSize: ETextSize.LARGER });
    renderPage();
    const slider = screen.getByRole("slider", { name: text.textSize });
    expect(slider.getAttribute("aria-describedby")).toBe(SETTINGS_DESCRIPTION_IDS.TEXT_SIZE);
    expect(document.getElementById(SETTINGS_DESCRIPTION_IDS.TEXT_SIZE)?.textContent).toBe(
      text.textSizeOptions.larger,
    );
  });
});
