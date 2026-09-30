import { LOCAL_STORAGE_KEYS } from "@/constants";
import { EUpdateFlashVariant } from "@/enums";
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

describe("settings store", () => {
  it("defaults to animations on and the Glow highlight", async () => {
    const store = await loadStore();
    expect(store.getState().animationsEnabled).toBe(true);
    expect(store.getState().updateFlashVariant).toBe(EUpdateFlashVariant.GLOW);
  });

  it("persists the animation settings", async () => {
    const store = await loadStore();
    store.getState().toggleAnimations();
    store.getState().setUpdateFlashVariant(EUpdateFlashVariant.BORDER);
    expect(saved()).toMatchObject({
      animationsEnabled: false,
      updateFlashVariant: EUpdateFlashVariant.BORDER,
    });
    // * never the actions or the hydration flag
    expect(saved()).not.toHaveProperty("hasHydrated");
    expect(saved()).not.toHaveProperty("toggleAnimations");
  });

  it("restores the saved settings on the next load", async () => {
    const first = await loadStore();
    first.getState().toggleAnimations();
    first.getState().setUpdateFlashVariant(EUpdateFlashVariant.BORDER);

    const next = await loadStore();
    expect(next.getState().animationsEnabled).toBe(false);
    expect(next.getState().updateFlashVariant).toBe(EUpdateFlashVariant.BORDER);
    expect(next.getState().hasHydrated).toBe(true);
  });

  it("keeps the defaults for invalid saved values", async () => {
    storage.setItem(
      LOCAL_STORAGE_KEYS.SETTINGS,
      JSON.stringify({
        state: { animationsEnabled: "no", updateFlashVariant: "sparkle" },
        version: 0,
      }),
    );
    const store = await loadStore();
    expect(store.getState().animationsEnabled).toBe(true);
    expect(store.getState().updateFlashVariant).toBe(EUpdateFlashVariant.GLOW);
  });

  it("keeps the other settings when adding the new ones to an old entry", async () => {
    storage.setItem(
      LOCAL_STORAGE_KEYS.SETTINGS,
      JSON.stringify({ state: { autoScroll: true, syncCity: false }, version: 0 }),
    );
    const store = await loadStore();
    expect(store.getState()).toMatchObject({
      autoScroll: true,
      syncCity: false,
      animationsEnabled: true,
      updateFlashVariant: EUpdateFlashVariant.GLOW,
    });
  });
});
