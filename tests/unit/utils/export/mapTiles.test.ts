import { MAP_TILE_CONFIG, REFERRER_POLICY } from "@/constants";
import { fetchTileDataUrl } from "@/utils/export/svg/mapTiles.util";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("the heat map export's tile fetches", () => {
  it("ask the one tile URL with our origin as Referer, in the default cache mode", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    vi.stubGlobal("fetch", fetchMock);
    await fetchTileDataUrl(1, 2, 3);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      MAP_TILE_CONFIG.url.replace("{z}", "3").replace("{x}", "1").replace("{y}", "2"),
    );
    expect(init).toMatchObject({ referrerPolicy: REFERRER_POLICY });
    // * no cache override, no headers: nothing like no-cache reaches the tile server
    expect(init).not.toHaveProperty("cache");
    expect(init).not.toHaveProperty("headers");
  });

  it("send the origin cross-site, never no-referrer", () => {
    expect(REFERRER_POLICY).toBe("strict-origin-when-cross-origin");
  });
});
