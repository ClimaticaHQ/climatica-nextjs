// @vitest-environment jsdom
import { useGeolocation } from "@/hooks/ui/useGeolocation";
import messages from "@/i18n/locales/en.json";
import type { TCity } from "@/types";
import { act, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const lookup = vi.hoisted(() => ({ resolve: vi.fn() }));
vi.mock("@/hooks/data/useResolveCityByCoordinates", () => ({
  useResolveCityByCoordinates: () => ({ isLoading: false, mutateAsync: lookup.resolve }),
}));

// * the nearest place is 3 km from the reader: its coordinates must never become the reader's
const NEAREST: TCity = { id: "702550", label: "Lviv", description: "city", lat: 49.84, lng: 24.03 };
const POSITION = { latitude: 49.8123, longitude: 24.0456 };

const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

function stubPosition() {
  const coords: GeolocationCoordinates = {
    ...POSITION,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    toJSON: () => POSITION,
  };
  const position: GeolocationPosition = { coords, timestamp: 0, toJSON: () => ({ coords }) };
  const getCurrentPosition = vi.fn((onSuccess: PositionCallback) => onSuccess(position));
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
}

beforeEach(() => {
  lookup.resolve.mockReset();
  stubPosition();
});
afterEach(() => vi.unstubAllGlobals());

describe("useGeolocation", () => {
  it("selects the reader's exact position at once, then only renames it", async () => {
    lookup.resolve.mockResolvedValue(NEAREST);
    const onLocated = vi.fn();
    const onRenamed = vi.fn();
    const { result } = renderHook(() => useGeolocation(), { wrapper });

    await act(async () => result.current.locate({ onLocated, onRenamed }));

    const point = onLocated.mock.calls[0]?.[0];
    expect(point).toMatchObject({
      id: "geo:49.8123,24.0456",
      label: "My location 49.8123, 24.0456",
      lat: POSITION.latitude,
      lng: POSITION.longitude,
    });
    expect(lookup.resolve).toHaveBeenCalledWith({
      lat: POSITION.latitude,
      lng: POSITION.longitude,
    });
    expect(onRenamed).toHaveBeenCalledWith({
      picked: point,
      renamed: { ...NEAREST, lat: POSITION.latitude, lng: POSITION.longitude },
    });
    expect(result.current.isLocating).toBe(false);
    expect(result.current.locationError).toBeNull();
  });

  it("keeps the position, without an error, when the place lookup fails", async () => {
    lookup.resolve.mockRejectedValue(new Error("Solr down"));
    const onLocated = vi.fn();
    const onRenamed = vi.fn();
    const { result } = renderHook(() => useGeolocation(), { wrapper });

    await act(async () => result.current.locate({ onLocated, onRenamed }));

    expect(onLocated).toHaveBeenCalledTimes(1);
    expect(onRenamed).not.toHaveBeenCalled();
    expect(result.current.locationError).toBeNull();
  });
});
