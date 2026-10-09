// @vitest-environment jsdom
import { LEGACY_THEME_STORAGE_KEY, LOCAL_STORAGE_KEYS } from "@/constants";
import { ETheme } from "@/enums";
import { applyTheme, readStoredTheme, storeTheme } from "@/utils/theme.util";
import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("theme storage", () => {
  it("reads back the stored theme", () => {
    storeTheme(ETheme.DARK);
    expect(readStoredTheme()).toBe(ETheme.DARK);
  });

  it("is null with nothing stored, or an unknown value", () => {
    expect(readStoredTheme()).toBeNull();
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, "sepia");
    expect(readStoredTheme()).toBeNull();
  });

  it("moves a theme saved under the old key to the current one, then removes the old key", () => {
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, ETheme.DARK);
    expect(readStoredTheme()).toBe(ETheme.DARK);
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.THEME)).toBe(ETheme.DARK);
    expect(localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBeNull();
  });

  it("keeps the current key's theme over the old one", () => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, ETheme.LIGHT);
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, ETheme.DARK);
    expect(readStoredTheme()).toBe(ETheme.LIGHT);
    expect(localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBeNull();
  });

  it("applies dark as the class on <html>, and removes it for light", () => {
    applyTheme(ETheme.DARK);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    applyTheme(ETheme.LIGHT);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
