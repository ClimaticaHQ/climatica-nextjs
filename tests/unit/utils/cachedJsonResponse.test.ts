import { describe, expect, it, vi } from "vitest";

import { CACHE_STATUS, UPSTREAM_SOURCES } from "@/constants";
import { cachedJsonResponse, timeUpstream } from "@/utils";

describe("cachedJsonResponse", () => {
  it("answers the data as JSON with status 200", async () => {
    const res = cachedJsonResponse({ a: 1 }, { status: CACHE_STATUS.HIT });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ a: 1 });
  });

  it.each(Object.values(CACHE_STATUS))("sets X-Cache: %s", (status) => {
    const res = cachedJsonResponse([], { status });
    expect(res.headers.get("X-Cache")).toBe(status);
  });

  it("omits Server-Timing without an upstream call", () => {
    const res = cachedJsonResponse([], { status: CACHE_STATUS.HIT });
    expect(res.headers.get("Server-Timing")).toBeNull();
  });

  it("names the upstream service and its duration in Server-Timing", () => {
    const res = cachedJsonResponse([], {
      status: CACHE_STATUS.MISS,
      upstream: { source: UPSTREAM_SOURCES.SOLR, durationMs: 12.345 },
    });
    expect(res.headers.get("Server-Timing")).toBe("solr;dur=12.3");
  });
});

describe("timeUpstream", () => {
  it("returns the call's result with its source and elapsed time", async () => {
    vi.spyOn(performance, "now").mockReturnValueOnce(100).mockReturnValueOnce(142.5);

    const { result, timing } = await timeUpstream(UPSTREAM_SOURCES.WORLDCLIM, () =>
      Promise.resolve("data"),
    );
    expect(result).toBe("data");
    expect(timing).toEqual({ source: "worldclim", durationMs: 42.5 });
    vi.restoreAllMocks();
  });

  it("lets a rejection through", async () => {
    await expect(
      timeUpstream(UPSTREAM_SOURCES.WIKIDATA, () => Promise.reject(new Error("down"))),
    ).rejects.toThrow("down");
  });
});
