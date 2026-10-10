// @vitest-environment jsdom
import { useMapPointSelection } from "@/hooks/pages/useMapPointSelection";
import messages from "@/i18n/locales/en.json";
import type { TCity } from "@/types";
import { act, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const lookup = vi.hoisted(() => ({ resolve: vi.fn() }));
vi.mock("@/hooks/data/useResolveCityByCoordinates", () => ({
  useResolveCityByCoordinates: () => ({ isLoading: false, mutateAsync: lookup.resolve }),
}));

const LVIV: TCity = { id: "Q36036", label: "Lviv", description: "city", lat: 49.84, lng: 24.03 };
const wrapper = ({ children }: { children: ReactNode }) => (
  <NextIntlClientProvider locale="en" messages={messages}>
    {children}
  </NextIntlClientProvider>
);

function setup() {
  const onPicked = vi.fn();
  const onResolved = vi.fn();
  const hook = renderHook(() => useMapPointSelection({ onPicked, onResolved }), { wrapper });
  return { hook, onPicked, onResolved };
}

beforeEach(() => lookup.resolve.mockReset());

describe("useMapPointSelection", () => {
  it("selects the point under its coordinates at once, then renames it at the clicked spot", async () => {
    lookup.resolve.mockResolvedValue(LVIV);
    const { hook, onPicked, onResolved } = setup();

    await act(async () => hook.result.current.pickPoint(49.8397, 24.0297));

    expect(onPicked.mock.calls[0]?.[0]).toMatchObject({
      id: "map:49.8397,24.0297",
      label: "Map point 49.8397, 24.0297",
    });
    expect(onResolved).toHaveBeenCalledWith({ ...LVIV, lat: 49.8397, lng: 24.0297 });
    expect(hook.result.current.lookupError).toBeNull();
  });

  it("a slower lookup for an earlier click never renames the later point", async () => {
    let answerFirst: (city: TCity) => void = () => undefined;
    lookup.resolve
      .mockImplementationOnce(() => new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce(null);
    const { hook, onResolved } = setup();

    await act(async () => hook.result.current.pickPoint(1, 1));
    await act(async () => hook.result.current.pickPoint(2, 2));
    await act(async () => answerFirst(LVIV));

    expect(onResolved).not.toHaveBeenCalled();
  });

  it("a failed lookup keeps the coordinates and says so, until dismissed", async () => {
    lookup.resolve.mockRejectedValueOnce(new Error("Wikidata down"));
    const { hook, onResolved } = setup();

    await act(async () => {
      hook.result.current.pickPoint(1, 1);
      // * the lookup's rejection settles a tick later
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(onResolved).not.toHaveBeenCalled();
    expect(hook.result.current.lookupError).toBe(messages.errors.placeLookupFailed);

    act(() => hook.result.current.clearLookupError());
    expect(hook.result.current.lookupError).toBeNull();
  });
});
