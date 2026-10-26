// @vitest-environment jsdom
import { Settings } from "@/app/settings/_components/Settings";
import { SETTINGS_DEFAULTS } from "@/constants";
import messages from "@/i18n/locales/en.json";
import { useSettingsStore } from "@/stores/settingsStore";
import { act, cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/libs/actions/setLocale.action", () => ({ setLocale: vi.fn() }));

// * a device whose reduced-motion preference the test can change while the page is open
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
// * the hint and the description share one cell; the one not in use is hidden from everyone
const isShown = (content: string) =>
  screen.getByText(content).getAttribute("aria-hidden") !== "true";

describe("Settings page: Update highlight depends on Animations", () => {
  it("is enabled while animations are on, with its description", () => {
    renderPage();
    expect(highlightOptions().every((option) => !option.hasAttribute("disabled"))).toBe(true);
    expect(isShown(text.descriptions.updateHighlight)).toBe(true);
    expect(isShown(text.hints.turnOnAnimations)).toBe(false);
  });

  it("stays rendered but disabled when animations are off, with the hint", () => {
    useSettingsStore.setState({ animationsEnabled: false });
    renderPage();
    expect(highlightOptions().every((option) => option.hasAttribute("disabled"))).toBe(true);
    expect(isShown(text.hints.turnOnAnimations)).toBe(true);
    expect(isShown(text.descriptions.updateHighlight)).toBe(false);
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
    expect(screen.getByText(text.reducedMotionNotice)).toBeTruthy();
    expect(highlightOptions().every((option) => option.hasAttribute("disabled"))).toBe(true);
    // * turning animations on isn't the reader's to do, so no hint telling them to
    expect(screen.queryByText(text.hints.turnOnAnimations)).toBeNull();
    // * the saved choice is kept for when the device stops asking
    expect(useSettingsStore.getState().animationsEnabled).toBe(true);
  });

  it("reacts live when the device's setting changes", () => {
    renderPage();
    expect(animationsSwitch().hasAttribute("disabled")).toBe(false);

    setReducedMotion(true);
    expect(animationsSwitch().hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(text.reducedMotionNotice)).toBeTruthy();
    expect(highlightOptions().every((option) => option.hasAttribute("disabled"))).toBe(true);

    setReducedMotion(false);
    expect(isAnimationsChecked()).toBe(true);
    expect(highlightOptions().every((option) => !option.hasAttribute("disabled"))).toBe(true);
    expect(screen.queryByText(text.reducedMotionNotice)).toBeNull();
  });
});
