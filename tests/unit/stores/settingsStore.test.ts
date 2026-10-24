import { LOCAL_STORAGE_KEYS } from "@/constants";
import { ETheme, EUpdateFlashVariant } from "@/enums";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** A localStorage for the node test environment. */
function createMemoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
    clear: () => items.clear(),
    key: (index: number) => [...items.keys()][index] ?? null,
    get length() {
      return items.size;
    },
  };
}

let storage: ReturnType<typeof createMemoryStorage>;

/** A fresh store, rehydrated from whatever the storage holds now. */
async function loadStore() {
  vi.resetModules();
  const { useSettingsStore } = await import("@/stores/settingsStore");
  return useSettingsStore;
}

const saved = () => JSON.parse(storage.getItem(LOCAL_STORAGE_KEYS.SETTINGS) ?? "{}").state;

beforeEach(() => {
  storage = createMemoryStorage();
  // * zustand's persist reads window.localStorage
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const saveEntry = (state: Record<string, unknown>, version: number) =>
  storage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify({ state, version }));

describe("settings store", () => {
  it("starts from the defaults: system theme, animations on, Glow, auto-apply and sync on", async () => {
    const store = await loadStore();
    expect(store.getState()).toMatchObject({
      theme: ETheme.SYSTEM,
      animationsEnabled: true,
      updateFlashVariant: EUpdateFlashVariant.GLOW,
      autoApplyFilters: true,
      syncCity: true,
      syncFilters: true,
      autoScroll: false,
      chartBarStyle: "plain",
      hasHydrated: true,
    });
  });

  it("saves every setting as one object, at version 1 — never the actions or the hydration flag", async () => {
    const store = await loadStore();
    store.getState().setSetting("theme", ETheme.DARK);
    store.getState().setSetting("animationsEnabled", false);
    store.getState().setSetting("updateFlashVariant", EUpdateFlashVariant.BORDER);
    expect(saved()).toEqual({
      theme: ETheme.DARK,
      animationsEnabled: false,
      updateFlashVariant: EUpdateFlashVariant.BORDER,
      autoApplyFilters: true,
      syncCity: true,
      syncFilters: true,
      autoScroll: false,
      chartBarStyle: "plain",
    });
    expect(JSON.parse(storage.getItem(LOCAL_STORAGE_KEYS.SETTINGS) ?? "{}").version).toBe(1);
  });

  it("restores the saved settings on the next load", async () => {
    const first = await loadStore();
    first.getState().setSetting("theme", ETheme.LIGHT);
    first.getState().setSetting("autoScroll", true);

    const next = await loadStore();
    expect(next.getState()).toMatchObject({ theme: ETheme.LIGHT, autoScroll: true });
  });

  it("keeps the defaults for invalid saved values", async () => {
    saveEntry({ theme: "sepia", animationsEnabled: "no", updateFlashVariant: "sparkle" }, 1);
    const store = await loadStore();
    expect(store.getState()).toMatchObject({
      theme: ETheme.SYSTEM,
      animationsEnabled: true,
      updateFlashVariant: EUpdateFlashVariant.GLOW,
    });
  });
});

describe("syncFilters", () => {
  it("an entry saved before it existed keeps filters synced; a saved off stays off", async () => {
    saveEntry({ syncCity: false }, 1);
    expect((await loadStore()).getState().syncFilters).toBe(true);
    saveEntry({ syncFilters: false }, 1);
    expect((await loadStore()).getState().syncFilters).toBe(false);
    saveEntry({ syncFilters: "no" }, 1);
    expect((await loadStore()).getState().syncFilters).toBe(true);
  });
});

describe("chartBarStyle", () => {
  it("is saved with the rest and restored on the next load", async () => {
    const first = await loadStore();
    first.getState().setSetting("chartBarStyle", "shades");
    expect(saved().chartBarStyle).toBe("shades");
    expect((await loadStore()).getState().chartBarStyle).toBe("shades");
  });

  it("an entry saved before it existed loads with plain", async () => {
    saveEntry({ theme: ETheme.DARK, autoScroll: true }, 1);
    const store = await loadStore();
    expect(store.getState()).toMatchObject({ theme: ETheme.DARK, chartBarStyle: "plain" });
  });

  it("an invalid saved value falls back to plain; each valid one is kept", async () => {
    for (const invalid of ["stripes", 3, null, true]) {
      saveEntry({ chartBarStyle: invalid }, 1);
      expect((await loadStore()).getState().chartBarStyle).toBe("plain");
    }
    for (const barStyle of ["plain", "shades", "hatch"]) {
      saveEntry({ chartBarStyle: barStyle }, 1);
      expect((await loadStore()).getState().chartBarStyle).toBe(barStyle);
    }
  });

  it("a version 0 entry (before the theme moved in) loads with plain too", async () => {
    saveEntry({ autoScroll: true }, 0);
    expect((await loadStore()).getState().chartBarStyle).toBe("plain");
  });
});

describe("settings store migration (version 0 → 1)", () => {
  it("keeps a version 0 entry's settings, and takes the theme from climatica:theme", async () => {
    saveEntry({ autoScroll: true, syncCity: false, autoApplyFilters: false }, 0);
    storage.setItem("climatica:theme", ETheme.DARK);
    const store = await loadStore();
    expect(store.getState()).toMatchObject({
      autoScroll: true,
      syncCity: false,
      autoApplyFilters: false,
      theme: ETheme.DARK,
    });
    expect(saved()).toMatchObject({ theme: ETheme.DARK, autoScroll: true });
  });

  it("brings a saved theme over even without saved settings", async () => {
    storage.setItem("climatica:theme", ETheme.LIGHT);
    const store = await loadStore();
    expect(store.getState().theme).toBe(ETheme.LIGHT);
  });

  it("reads the oldest key (theme) when climatica:theme has none", async () => {
    storage.setItem("theme", ETheme.DARK);
    const store = await loadStore();
    expect(store.getState().theme).toBe(ETheme.DARK);
  });

  it("prefers climatica:theme over the oldest key", async () => {
    storage.setItem("climatica:theme", ETheme.LIGHT);
    storage.setItem("theme", ETheme.DARK);
    const store = await loadStore();
    expect(store.getState().theme).toBe(ETheme.LIGHT);
  });

  it("falls back to system for an invalid old theme", async () => {
    saveEntry({ autoScroll: true }, 0);
    storage.setItem("climatica:theme", "sepia");
    const store = await loadStore();
    expect(store.getState()).toMatchObject({ theme: ETheme.SYSTEM, autoScroll: true });
  });

  it("ignores the old theme keys once a version 1 entry exists", async () => {
    saveEntry({ theme: ETheme.LIGHT }, 1);
    storage.setItem("climatica:theme", ETheme.DARK);
    const store = await loadStore();
    expect(store.getState().theme).toBe(ETheme.LIGHT);
  });
});
