import type { TCity, TKeyValueStorage } from "@/types";
import {
  createPersistedJsonStore,
  isCity,
  renameIfStillPicked,
} from "@/utils/persistedJsonStore.util";
import { describe, expect, it } from "vitest";

const POINT: TCity = {
  id: "map:49.8397,24.0297",
  label: "Map point",
  description: "",
  lat: 49.8397,
  lng: 24.0297,
};
const LVIV: TCity = { id: "702550", label: "Lviv", description: "", lat: 49.8397, lng: 24.0297 };
const KYIV: TCity = { id: "703448", label: "Kyiv", description: "", lat: 50.45, lng: 30.52 };

function makeStore(initial: TCity) {
  const values = new Map<string, string>();
  const storage: TKeyValueStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
  const store = createPersistedJsonStore({
    key: "city",
    defaultValue: initial,
    isValue: isCity,
    getStorage: () => storage,
  });
  store.set(initial);
  return store;
}

describe("renameIfStillPicked", () => {
  it("renames the pick while it's still the store's city", () => {
    const store = makeStore(POINT);
    renameIfStillPicked(store, { picked: POINT, renamed: LVIV });
    expect(store.getSnapshot()).toEqual(LVIV);
  });

  it("leaves a newer pick alone when a slow lookup answers", () => {
    const store = makeStore(POINT);
    store.set(KYIV);
    renameIfStillPicked(store, { picked: POINT, renamed: LVIV });
    expect(store.getSnapshot()).toEqual(KYIV);
  });
});
