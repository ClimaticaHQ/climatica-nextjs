// @vitest-environment jsdom
import { LOCAL_STORAGE_KEYS, PREFERS_DARK_MEDIA_QUERY, THEME_INIT_SCRIPT } from "@/constants";
import { ETheme } from "@/enums";
import { applyDarkClass, isDarkTheme, isTheme } from "@/utils/theme.util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const isDark = () => document.documentElement.classList.contains(ETheme.DARK);

/** The device's colour-scheme preference, as matchMedia reports it. */
function prefersDark(value: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: query === PREFERS_DARK_MEDIA_QUERY && value })),
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

afterEach(() => vi.unstubAllGlobals());

describe("theme resolution", () => {
  it.each([
    [ETheme.LIGHT, false, false],
    [ETheme.LIGHT, true, false],
    [ETheme.DARK, false, true],
    [ETheme.DARK, true, true],
    [ETheme.SYSTEM, false, false],
    [ETheme.SYSTEM, true, true],
  ])("%s on a device preferring dark: %s → dark %s", (theme, device, expected) => {
    expect(isDarkTheme(theme, device)).toBe(expected);
  });

  it("knows the three themes and nothing else", () => {
    expect([ETheme.LIGHT, ETheme.DARK, ETheme.SYSTEM].every(isTheme)).toBe(true);
    expect(isTheme("sepia")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it("puts the dark class on <html>, and takes it off", () => {
    applyDarkClass(true);
    expect(isDark()).toBe(true);
    applyDarkClass(false);
    expect(isDark()).toBe(false);
  });
});

// * the script runs in <head> before the first paint — these run it as the browser would
describe("the inline theme script", () => {
  const run = () => new Function(THEME_INIT_SCRIPT)();
  const saveTheme = (theme: unknown) =>
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SETTINGS,
      JSON.stringify({ state: { theme }, version: 1 }),
    );

  it("applies a saved dark theme", () => {
    prefersDark(false);
    saveTheme(ETheme.DARK);
    run();
    expect(isDark()).toBe(true);
  });

  it("applies a saved light theme on a dark device", () => {
    prefersDark(true);
    saveTheme(ETheme.LIGHT);
    run();
    expect(isDark()).toBe(false);
  });

  it("follows the device for system — and with nothing saved", () => {
    prefersDark(true);
    saveTheme(ETheme.SYSTEM);
    run();
    expect(isDark()).toBe(true);
    localStorage.clear();
    document.documentElement.className = "";
    run();
    expect(isDark()).toBe(true);
  });

  it("falls back to an older version's key before the store has migrated it", () => {
    prefersDark(false);
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.SETTINGS,
      JSON.stringify({ state: { autoScroll: true }, version: 0 }),
    );
    localStorage.setItem("theme", ETheme.DARK);
    run();
    expect(isDark()).toBe(true);
  });

  it("treats an invalid or unreadable saved value as system", () => {
    prefersDark(true);
    saveTheme("sepia");
    run();
    expect(isDark()).toBe(true);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, "{not json");
    document.documentElement.className = "";
    prefersDark(false);
    run();
    expect(isDark()).toBe(false);
  });
});
