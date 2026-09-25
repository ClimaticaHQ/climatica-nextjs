import {
  computeFitZoom,
  computeMapOrigin,
  computeTileRange,
  projectLatLngToPixel,
  projectToMapPixel,
  resolveTileZoom,
} from "@/utils/mapProjection.util";
import { describe, expect, it } from "vitest";

describe("projectLatLngToPixel", () => {
  it("(0,0) at zoom 0 is the center of the single 256×256 world tile", () => {
    expect(projectLatLngToPixel(0, 0, 0)).toEqual({ x: 128, y: 128 });
  });

  it("west/east antimeridian at zoom 0 map to the world's left/right edges", () => {
    expect(projectLatLngToPixel(0, -180, 0)).toEqual({ x: 0, y: 128 });
    expect(projectLatLngToPixel(0, 180, 0)).toEqual({ x: 256, y: 128 });
  });

  it("doubling zoom doubles the world size, so (0,0) moves proportionally", () => {
    expect(projectLatLngToPixel(0, 0, 1)).toEqual({ x: 256, y: 256 });
  });

  it("respects a custom tile size", () => {
    expect(projectLatLngToPixel(0, 0, 0, 512)).toEqual({ x: 256, y: 256 });
  });
});

describe("computeTileRange", () => {
  it("a bbox spanning the whole world at zoom 2 covers all 4×4 tiles", () => {
    expect(computeTileRange({ north: 80, south: -80, west: -180, east: 180 }, 2)).toEqual({
      minX: 0,
      maxX: 3,
      minY: 0,
      maxY: 3,
    });
  });

  it("clamps tile indices to the valid [0, 2^zoom - 1] grid", () => {
    const range = computeTileRange({ north: 80, south: -80, west: -180, east: 180 }, 0);
    expect(range).toEqual({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  });

  it("a small bbox near the origin resolves to a small tile range", () => {
    expect(computeTileRange({ north: 1, south: -1, west: -1, east: 1 }, 10)).toEqual({
      minX: 509,
      maxX: 514,
      minY: 509,
      maxY: 514,
    });
  });
});

describe("computeFitZoom", () => {
  it("a small bbox fits at a high zoom", () => {
    expect(computeFitZoom({ north: 1, south: -1, west: -1, east: 1 }, 920, 400, 0.1)).toBe(7);
  });

  it("the whole world never fits a small viewport, so it falls back to zoom 0", () => {
    expect(computeFitZoom({ north: 80, south: -80, west: -180, east: 180 }, 920, 400, 0.1)).toBe(0);
  });

  it("a larger viewport allows a higher fit zoom for the same bbox", () => {
    const bbox = { north: 1, south: -1, west: -1, east: 1 };
    const smallViewportZoom = computeFitZoom(bbox, 920, 400, 0.1);
    const largeViewportZoom = computeFitZoom(bbox, 1840, 800, 0.1);
    expect(largeViewportZoom).toBeGreaterThan(smallViewportZoom);
  });
});

describe("computeMapOrigin", () => {
  it("the viewport center maps back to exactly (viewportWidth/2, viewportHeight/2)", () => {
    const zoom = 8;
    const origin = computeMapOrigin(10, 20, zoom, 920, 400);
    const centerPixel = projectToMapPixel(10, 20, zoom, origin);
    expect(centerPixel.x).toBeCloseTo(460, 9);
    expect(centerPixel.y).toBeCloseTo(200, 9);
  });
});

describe("projectToMapPixel", () => {
  it("subtracts the origin from the world pixel", () => {
    const zoom = 3;
    const origin = { x: 100, y: 50 };
    const world = projectLatLngToPixel(5, 5, zoom);
    expect(projectToMapPixel(5, 5, zoom, origin)).toEqual({
      x: world.x - origin.x,
      y: world.y - origin.y,
    });
  });
});

describe("resolveTileZoom", () => {
  it("fetches one zoom level higher at pixelRatio 2, drawn at half size", () => {
    expect(resolveTileZoom(10, 2)).toEqual({ tileZoom: 11, zoomDelta: 1, tileDrawSizePx: 128 });
  });

  it("pixelRatio 1 needs no sharper tiles", () => {
    expect(resolveTileZoom(10, 1)).toEqual({ tileZoom: 10, zoomDelta: 0, tileDrawSizePx: 256 });
  });

  it("caps at maxZoom instead of requesting a zoom that doesn't exist", () => {
    expect(resolveTileZoom(19, 2, 256, 19)).toEqual({
      tileZoom: 19,
      zoomDelta: 0,
      tileDrawSizePx: 256,
    });
  });

  it("still caps when fittedZoom is one below maxZoom", () => {
    expect(resolveTileZoom(18, 2, 256, 19)).toEqual({
      tileZoom: 19,
      zoomDelta: 1,
      tileDrawSizePx: 128,
    });
  });
});

describe("tile placement matches overlay projection at the same lat/lng", () => {
  it("a tile fetched at fittedZoom+1 and scaled down lands on the same canvas pixel as the direct fittedZoom overlay projection", () => {
    const fittedZoom = 5;
    const tileSizePx = 256;
    const origin = { x: 4000, y: 4000 };
    const { tileZoom, zoomDelta, tileDrawSizePx } = resolveTileZoom(fittedZoom, 2, tileSizePx);
    expect(zoomDelta).toBe(1);

    // (0,0) lands exactly on a tile's world-pixel corner at any zoom (no rounding),
    // making it an exact reference point for this cross-check.
    const worldPixelAtTileZoom = projectLatLngToPixel(0, 0, tileZoom, tileSizePx);
    const tileX = Math.floor(worldPixelAtTileZoom.x / tileSizePx);
    const tileY = Math.floor(worldPixelAtTileZoom.y / tileSizePx);
    expect(tileX * tileSizePx).toBe(worldPixelAtTileZoom.x); // exact tile-boundary sanity check

    // "Tile path": where the tile draws on the fittedZoom canvas, plus the point's
    // offset within that (now-scaled-down) tile image.
    const tileDrawX = tileX * tileDrawSizePx - origin.x;
    const tileDrawY = tileY * tileDrawSizePx - origin.y;
    const offsetWithinTile = { x: 0, y: 0 }; // (0,0) sits exactly at this tile's own origin

    // "Overlay path": project the same lat/lng directly at fittedZoom.
    const overlayPixel = projectToMapPixel(0, 0, fittedZoom, origin);

    expect(tileDrawX + offsetWithinTile.x).toBeCloseTo(overlayPixel.x, 9);
    expect(tileDrawY + offsetWithinTile.y).toBeCloseTo(overlayPixel.y, 9);
  });
});
