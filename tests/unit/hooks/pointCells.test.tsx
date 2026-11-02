// @vitest-environment jsdom
import { useGetAltitude } from "@/hooks/data/useGetAltitude";
import { useGetCellBounds } from "@/hooks/data/useGetCellBounds";
import { WorldClimService } from "@/libs/services/worldClimService";
import type { TWorldClimCellResponse } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/libs/services/worldClimService", () => ({
  WorldClimService: { getCellsForPoint: vi.fn(), getCellResource: vi.fn() },
}));

const D = "http://climate.gsic.uva.es/data/";
const CELLS: TWorldClimCellResponse = {
  results: {
    bindings: [
      {
        cell: { type: "uri", value: `${D}Cell_10m_r122c1193` },
        grid: { type: "uri", value: `${D}Grid_10m` },
      },
      {
        cell: { type: "uri", value: `${D}Cell_5m_r244c2387` },
        grid: { type: "uri", value: `${D}Grid_5m` },
      },
    ],
  },
};

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return QueryWrapper;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(WorldClimService.getCellsForPoint).mockResolvedValue(structuredClone(CELLS));
  vi.mocked(WorldClimService.getCellResource).mockResolvedValue({ iri: "x", elevation: 12 });
});

describe("altitude and cell bounds of one point", () => {
  it("share a single cellofpoint request", async () => {
    const { result } = renderHook(
      () => ({
        altitude: useGetAltitude(69.6492, 18.9553, "10m"),
        bounds: useGetCellBounds(69.6492, 18.9553, "10m"),
      }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.altitude.data).toBe(12));
    expect(result.current.bounds.data).toMatchObject({ north: 90 - 122 / 6 });
    expect(WorldClimService.getCellsForPoint).toHaveBeenCalledTimes(1);
    expect(WorldClimService.getCellResource).toHaveBeenCalledWith(`${D}Cell_10m_r122c1193`);
  });

  it("don't refetch the cells when the grid changes", async () => {
    const { result, rerender } = renderHook(
      ({ grid }: { grid: "10m" | "5m" }) => useGetCellBounds(69.6492, 18.9553, grid),
      { wrapper: makeWrapper(), initialProps: { grid: "10m" } },
    );
    await waitFor(() => expect(result.current.data).not.toBeUndefined());

    rerender({ grid: "5m" });
    await waitFor(() => expect(result.current.data).toMatchObject({ north: 90 - 244 / 12 }));
    expect(WorldClimService.getCellsForPoint).toHaveBeenCalledTimes(1);
  });

  it("gives no altitude when the point has no cell at the grid", async () => {
    const { result } = renderHook(() => useGetAltitude(69.6492, 18.9553, "30s"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(WorldClimService.getCellsForPoint).toHaveBeenCalled());
    expect(result.current.data).toBeUndefined();
    expect(WorldClimService.getCellResource).not.toHaveBeenCalled();
  });
});
