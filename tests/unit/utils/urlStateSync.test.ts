import type { TCity, TKeyValueStorage } from "@/types";
import { useNavigationIntentStore } from "@/stores/navigationIntentStore";
import { navigateWithIntent } from "@/utils/navigation.util";
import { decideUrlSyncAction } from "@/utils/urlParams.util";
import { createPersistedJsonStore, isCity } from "@/utils/persistedJsonStore.util";
import { canWriteUrlState, getLinkNavigationTarget } from "@/utils/urlStateGuard.util";
import { describe, expect, it, vi } from "vitest";

const MADRID: TCity = { id: "madrid", label: "Madrid", description: "", lat: 40.4, lng: -3.7 };
const BERLIN: TCity = { id: "berlin", label: "Berlin", description: "", lat: 52.5, lng: 13.4 };

function memoryStorage(initial: Record<string, string> = {}): TKeyValueStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

// * bug 1: clicking Compare Cities → Compare Periods sometimes stayed on compare-cities — the
// * old page's replace() fired while the link navigation was in flight and cancelled it
describe("canWriteUrlState", () => {
  const page = "/compare-cities";
  const search = { currentSearch: "cityA=Paris", scheduledSearch: "cityA=Paris" };

  it("writes while the page is the current route and nothing is navigating away", () => {
    expect(
      canWriteUrlState({
        ...search,
        currentPathname: page,
        pagePathname: page,
        pendingPathname: null,
      }),
    ).toBe(true);
  });

  it("never writes while a link navigation is on its way to another page", () => {
    expect(
      canWriteUrlState({
        ...search,
        currentPathname: page,
        pagePathname: page,
        pendingPathname: "/compare-periods",
      }),
    ).toBe(false);
  });

  it("never writes for a page that is no longer the browser's route", () => {
    expect(
      canWriteUrlState({
        ...search,
        currentPathname: "/compare-periods",
        pagePathname: page,
        pendingPathname: null,
      }),
    ).toBe(false);
  });

  it("never overwrites an entry that back/forward restored after the write was scheduled", () => {
    expect(
      canWriteUrlState({
        currentPathname: page,
        pagePathname: page,
        pendingPathname: null,
        currentSearch: "cityA=Rome",
        scheduledSearch: "cityA=Paris",
      }),
    ).toBe(false);
  });

  it("keeps writing when the pending navigation targets the page itself", () => {
    expect(
      canWriteUrlState({
        ...search,
        currentPathname: page,
        pagePathname: page,
        pendingPathname: page,
      }),
    ).toBe(true);
  });
});

describe("navigateWithIntent", () => {
  it("registers the intent before the router starts the navigation", () => {
    useNavigationIntentStore.getState().setPendingPathname(null);
    const pendingAtPush: (string | null)[] = [];
    const push = vi.fn(() => {
      pendingAtPush.push(useNavigationIntentStore.getState().pendingPathname);
    });

    navigateWithIntent({
      router: {
        push,
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn(),
        bfcacheId: "",
      },
      pathname: "/compare-cities",
      query: { cityA: "Paris" },
      locale: "de",
    });

    expect(pendingAtPush).toEqual(["/de/compare-cities"]);
    expect(push).toHaveBeenCalledWith(
      { pathname: "/compare-cities", query: { cityA: "Paris" } },
      { locale: "de", scroll: false },
    );
  });
});

describe("getLinkNavigationTarget", () => {
  const location = { origin: "http://localhost:3000", pathname: "/compare-cities" };
  const click = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
  const anchor = (href: string, target = "") => ({ href, target, hasAttribute: () => false });

  it("returns the target path of a plain click on an internal link", () => {
    expect(
      getLinkNavigationTarget({
        event: click,
        anchor: anchor("http://localhost:3000/compare-periods"),
        location,
      }),
    ).toBe("/compare-periods");
  });

  it("ignores links that don't leave the current route", () => {
    const cases = [
      { event: click, anchor: anchor("http://localhost:3000/compare-cities?x=1") },
      { event: click, anchor: anchor("https://example.com/compare-periods") },
      { event: click, anchor: anchor("http://localhost:3000/compare-periods", "_blank") },
      { event: { ...click, metaKey: true }, anchor: anchor("http://localhost:3000/heat-map") },
    ];
    cases.forEach((args) => expect(getLinkNavigationTarget({ ...args, location })).toBeNull());
  });
});

// * bug 2: the title showed "Madrid" on a Berlin URL — each component read its own copy of the
// * persisted city, captured before the URL / stored value was applied
describe("createPersistedJsonStore", () => {
  const key = "city";

  it("serves the stored value from the first client read, the default to the server", () => {
    const store = createPersistedJsonStore({
      key,
      defaultValue: MADRID,
      isValue: isCity,
      getStorage: () => memoryStorage({ [key]: JSON.stringify(BERLIN) }),
    });
    expect(store.getSnapshot()).toEqual(BERLIN);
    expect(store.getServerSnapshot()).toBe(MADRID);
  });

  it("shows a value set anywhere to every reader at once", () => {
    const storage = memoryStorage();
    const store = createPersistedJsonStore({
      key,
      defaultValue: MADRID,
      isValue: isCity,
      getStorage: () => storage,
    });
    const titleReader = vi.fn();
    const searchBarReader = vi.fn();
    store.subscribe(titleReader);
    store.subscribe(searchBarReader);

    store.set(BERLIN);

    expect(titleReader).toHaveBeenCalledOnce();
    expect(searchBarReader).toHaveBeenCalledOnce();
    expect(store.getSnapshot()).toEqual(BERLIN);
    expect(storage.getItem(key)).toBe(JSON.stringify(BERLIN));
  });

  it("keeps a snapshot's identity while the stored value is unchanged", () => {
    const store = createPersistedJsonStore({
      key,
      defaultValue: MADRID,
      isValue: isCity,
      getStorage: () => memoryStorage({ [key]: JSON.stringify(BERLIN) }),
    });
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it("reads malformed or foreign stored values as the default", () => {
    ["{not json", JSON.stringify({ label: "no coordinates" })].forEach((raw) => {
      const store = createPersistedJsonStore({
        key,
        defaultValue: MADRID,
        isValue: isCity,
        getStorage: () => memoryStorage({ [key]: raw }),
      });
      expect(store.getSnapshot()).toBe(MADRID);
    });
  });
});

describe("decideUrlSyncAction on the first run after hydration", () => {
  it("restores from the URL before anything is written — the URL wins over persisted state", () => {
    expect(
      decideUrlSyncAction({
        searchParamsChanged: true,
        searchParamsString: "city=Berlin&lat=52.5&lng=13.4",
        lastWritten: null,
        nextFromState: "city=Madrid&lat=40.4&lng=-3.7",
      }),
    ).toBe("external");
  });
});
