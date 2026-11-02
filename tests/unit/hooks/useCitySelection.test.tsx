// @vitest-environment jsdom
import { ECitySlot } from "@/enums";
import { useCitySelection } from "@/hooks/pages/useCitySelection";
import { useSettingsStore } from "@/stores";
import type { TCity } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const slots = vi.hoisted(() => ({
  city: vi.fn(),
  comparisonA: vi.fn(),
  comparisonB: vi.fn(),
}));
const renames = vi.hoisted(() => ({
  city: vi.fn(),
  comparisonA: vi.fn(),
  comparisonB: vi.fn(),
}));

const lookup = vi.hoisted(() => ({ resolve: vi.fn() }));
vi.mock("@/hooks/data/useResolveCityByCoordinates", () => ({
  useResolveCityByCoordinates: () => ({ isLoading: false, mutateAsync: lookup.resolve }),
}));

vi.mock("@/hooks/persisted", () => ({
  usePersistedCity: () => ({ selectCity: slots.city, renameCity: renames.city }),
  usePersistedComparisonCities: () => ({
    selectCityA: slots.comparisonA,
    selectCityB: slots.comparisonB,
    renameCityA: renames.comparisonA,
    renameCityB: renames.comparisonB,
  }),
}));

const LVIV: TCity = { id: "702550", label: "Lviv", description: "", lat: 49.84, lng: 24.03 };
const queryClient = new QueryClient();

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

function pick(slot: ECitySlot, onPicked = vi.fn()) {
  renderHook(() => useCitySelection({ slot, onPicked }), { wrapper }).result.current.pickCity(LVIV);
  return onPicked;
}

const TYPED: TCity = {
  id: "coords:49.8397,24.0297",
  label: "49.8397, 24.0297",
  description: "Coordinates",
  lat: 49.8397,
  lng: 24.0297,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(queryClient, "invalidateQueries");
  useSettingsStore.setState({ syncCity: true, hasHydrated: true });
});

describe("useCitySelection", () => {
  it("City Climate's city follows into Compare Cities' first city, whose page refetches", () => {
    const onPicked = pick(ECitySlot.CITY);
    expect(slots.city).toHaveBeenCalledWith(LVIV);
    expect(slots.comparisonA).toHaveBeenCalledWith(LVIV);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["compare"] });
    expect(onPicked).toHaveBeenCalledWith(LVIV);
  });

  it("the heat map's search syncs both cities and persists nothing of its own", () => {
    pick(ECitySlot.MAP);
    expect(slots.city).toHaveBeenCalledWith(LVIV);
    expect(slots.comparisonA).toHaveBeenCalledWith(LVIV);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["climate"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["compare-periods"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["compare"] });
  });

  it("Compare Cities' second city never syncs", () => {
    pick(ECitySlot.COMPARISON_B);
    expect(slots.comparisonB).toHaveBeenCalledWith(LVIV);
    expect(slots.city).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });

  it("nothing syncs with syncCity off, or before the settings are loaded", () => {
    useSettingsStore.setState({ syncCity: false });
    pick(ECitySlot.CITY);
    useSettingsStore.setState({ syncCity: true, hasHydrated: false });
    pick(ECitySlot.CITY);
    expect(slots.city).toHaveBeenCalledTimes(2);
    expect(slots.comparisonA).not.toHaveBeenCalled();
  });

  it("renames typed coordinates in the same slots, at the typed spot, without refetching", async () => {
    lookup.resolve.mockResolvedValue(LVIV);
    const onPicked = vi.fn();
    const { result } = renderHook(() => useCitySelection({ slot: ECitySlot.CITY, onPicked }), {
      wrapper,
    });

    await act(async () => result.current.pickCity(TYPED));

    expect(lookup.resolve).toHaveBeenCalledWith({ lat: TYPED.lat, lng: TYPED.lng });
    const rename = { picked: TYPED, renamed: { ...LVIV, lat: TYPED.lat, lng: TYPED.lng } };
    expect(renames.city).toHaveBeenCalledWith(rename);
    expect(renames.comparisonA).toHaveBeenCalledWith(rename);
    expect(onPicked).toHaveBeenCalledTimes(1);
    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it("doesn't look up a picked city", () => {
    pick(ECitySlot.CITY);
    expect(lookup.resolve).not.toHaveBeenCalled();
  });

  it("drops a slow answer once another city was picked", async () => {
    let answer: (city: TCity) => void = () => undefined;
    lookup.resolve.mockImplementationOnce(() => new Promise((resolve) => (answer = resolve)));
    const { result } = renderHook(() => useCitySelection({ slot: ECitySlot.COMPARISON_B }), {
      wrapper,
    });

    await act(async () => result.current.pickCity(TYPED));
    await act(async () => result.current.pickCity(LVIV));
    await act(async () => answer({ ...LVIV, id: "late", label: "Late" }));

    expect(renames.comparisonB).not.toHaveBeenCalled();
  });

  it("keeps the coordinates when the lookup fails or finds nothing", async () => {
    lookup.resolve.mockRejectedValueOnce(new Error("busy")).mockResolvedValueOnce(null);
    const { result } = renderHook(() => useCitySelection({ slot: ECitySlot.COMPARISON_B }), {
      wrapper,
    });

    await act(async () => result.current.pickCity(TYPED));
    await act(async () => result.current.pickCity(TYPED));

    expect(renames.comparisonB).not.toHaveBeenCalled();
  });
});
