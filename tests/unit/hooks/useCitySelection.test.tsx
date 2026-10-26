// @vitest-environment jsdom
import { ECitySlot } from "@/enums";
import { useCitySelection } from "@/hooks/pages/useCitySelection";
import { useSettingsStore } from "@/stores";
import type { TCity } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const slots = vi.hoisted(() => ({
  city: vi.fn(),
  comparisonA: vi.fn(),
  comparisonB: vi.fn(),
}));

vi.mock("@/hooks/persisted", () => ({
  usePersistedCity: () => ({ selectCity: slots.city }),
  usePersistedComparisonCities: () => ({
    selectCityA: slots.comparisonA,
    selectCityB: slots.comparisonB,
  }),
}));

const LVIV: TCity = { id: "702550", label: "Lviv", description: "", lat: 49.84, lng: 24.03 };
const queryClient = new QueryClient();

function pick(slot: ECitySlot, onPicked = vi.fn()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  renderHook(() => useCitySelection({ slot, onPicked }), { wrapper }).result.current.pickCity(LVIV);
  return onPicked;
}

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
});
