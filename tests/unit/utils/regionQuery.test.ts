import { CELL_SIZES, FILTER_MAX_HEATMAP_CELLS, GRID_DELTA, WORLDCLIM_MAX_ROWS } from "@/constants";
import type { TBbox, TRawPixelValueBinding } from "@/types";
import {
  countCellsInBounds,
  countCellsInPolygon,
  getCellIndexRange,
  getFinestLoadableGrid,
  getPolygonBounds,
  isHeatmapCellLimitExceeded,
} from "@/utils/cellCount.util";
import {
  getStripRowLimit,
  isPointInPolygon,
  keepCellsInPolygon,
  mergeStripBindings,
  splitRegionIntoStrips,
} from "@/utils/regionQuery.util";
import { describe, expect, it } from "vitest";

const MONTHLY = 12;
const SIZE = GRID_DELTA["10m"] ?? 1 / 6;

/** every cell index the strips cover, so a cell in two strips shows up twice */
function coveredCells(strips: TBbox[]) {
  return strips.flatMap((strip) => {
    const { firstRow, lastRow, firstCol, lastCol } = getCellIndexRange(strip, "10m");
    return Array.from({ length: lastRow - firstRow + 1 }, (_, r) =>
      Array.from({ length: lastCol - firstCol + 1 }, (_, c) => `${firstRow + r}:${firstCol + c}`),
    ).flat();
  });
}

describe("splitRegionIntoStrips", () => {
  it("keeps a region one request answers in full as one strip", () => {
    const bounds = { north: 50, south: 49, west: 23, east: 24 };
    expect(splitRegionIntoStrips({ bounds, gridSize: "10m", rowsPerCell: MONTHLY })).toEqual([
      bounds,
    ]);
  });

  it.each([
    ["a tall region", { north: 60, south: 30, west: 10, east: 11 }],
    ["a square region", { north: 52.3, south: 44.71, west: 3.05, east: 10.6 }],
    ["a region one cell row high and very wide", { north: 50.1, south: 50, west: -100, east: 100 }],
  ])("covers every cell of %s exactly once, each strip within the row cap", (_, bounds) => {
    const strips = splitRegionIntoStrips({ bounds, gridSize: "10m", rowsPerCell: MONTHLY });
    const cells = coveredCells(strips);
    expect(cells).toHaveLength(countCellsInBounds(bounds, "10m"));
    expect(new Set(cells).size).toBe(cells.length);
    for (const strip of strips) {
      expect(getStripRowLimit(strip, "10m", MONTHLY)).toBeLessThanOrEqual(WORLDCLIM_MAX_ROWS);
    }
  });

  it("puts inner strip edges on grid lines, half a cell from any centroid", () => {
    const strips = splitRegionIntoStrips({
      bounds: { north: 60, south: 30, west: 10, east: 11 },
      gridSize: "10m",
      rowsPerCell: MONTHLY,
    });
    for (const strip of strips.slice(1)) {
      const linesFromPole = (90 - strip.north) / SIZE;
      expect(Math.abs(linesFromPole - Math.round(linesFromPole))).toBeLessThan(1e-4);
    }
  });

  // * every strip is one request against the proxy's rate limit (1,000 a minute per IP)
  it("needs at most 4 requests for any region within the heat map's cell cap", () => {
    let most = 0;
    for (let rows = 1; rows <= FILTER_MAX_HEATMAP_CELLS; rows++) {
      const cols = Math.floor(FILTER_MAX_HEATMAP_CELLS / rows);
      // * a region exactly rows × cols cells, its edges a quarter cell inside the grid lines
      const bounds = {
        north: 60 - SIZE / 4,
        south: 60 - rows * SIZE + SIZE / 4,
        west: SIZE / 4,
        east: cols * SIZE - SIZE / 4,
      };
      expect(countCellsInBounds(bounds, "10m")).toBe(rows * cols);
      most = Math.max(
        most,
        splitRegionIntoStrips({ bounds, gridSize: "10m", rowsPerCell: MONTHLY }).length,
      );
    }
    expect(most).toBeLessThanOrEqual(4);
  });

  it("has no strips for a region holding no cell centroid", () => {
    const sliver = { north: 50.01, south: 50, west: 23, east: 24 };
    expect(
      splitRegionIntoStrips({ bounds: sliver, gridSize: "10m", rowsPerCell: MONTHLY }),
    ).toEqual([]);
  });
});

describe("mergeStripBindings", () => {
  const row = (pixel: string, month: string, value: string): TRawPixelValueBinding => ({
    pixel: { type: "uri", value: pixel },
    month: { type: "literal", value: month },
    value: { type: "literal", value },
  });

  it("joins the strips' rows and keeps a row two strips returned once", () => {
    const merged = mergeStripBindings([
      [row("p1", "--01", "1"), row("p1", "--02", "2")],
      [row("p1", "--02", "2"), row("p2", "--01", "3")],
    ]);
    expect(merged.map((b) => `${b.pixel.value}${b.month.value}`)).toEqual([
      "p1--01",
      "p1--02",
      "p2--01",
    ]);
  });
});

describe("isPointInPolygon", () => {
  const triangle: [number, number][] = [
    [49, 23],
    [50, 23],
    [50, 24],
  ];
  it.each([
    [[49.9, 23.1], true],
    [[49.1, 23.9], false],
    [[51, 23.5], false],
  ] as const)("%j inside the triangle: %s", (point, expected) => {
    expect(isPointInPolygon([point[0], point[1]], triangle)).toBe(expected);
  });
});

describe("cell counts", () => {
  it("counts the cells whose centroids lie in the bounds", () => {
    expect(countCellsInBounds({ north: 50, south: 49, west: 23, east: 24 }, "10m")).toBe(36);
    expect(countCellsInBounds({ north: 50, south: 49, west: 23, east: 24 }, "5m")).toBe(144);
  });

  it("suggests the finest resolution a region fits at, or none", () => {
    // * 3° × 3°: 324 cells at 10′, 1,296 at 5′, 5,184 at 2.5′
    expect(getFinestLoadableGrid({ north: 50, south: 47, west: 20, east: 23 })).toBe(
      CELL_SIZES.FIVE_MINUTES,
    );
    expect(getFinestLoadableGrid({ north: 70, south: 20, west: -20, east: 40 })).toBeNull();
  });
});

// * a band about one cell wide from 43° N 0° E to 50° N 7° E: few cells, a 7° × 7° box. Its
// * vertices are off the grid lines, so no centroid sits exactly on an edge
const THIN_DIAGONAL: [number, number][] = [
  [43.013, 0.021],
  [50.007, 7.033],
  [50.009, 7.137],
  [43.017, 0.119],
];

describe("a thin diagonal polygon", () => {
  /** every cell of the box as a row, through the same filter the service uses */
  function cellsKeptByFilter(polygon: [number, number][], gridSize: "10m" | "5m") {
    const { firstRow, lastRow, firstCol, lastCol } = getCellIndexRange(
      getPolygonBounds(polygon),
      gridSize,
    );
    const rows: TRawPixelValueBinding[] = [];
    for (let r = firstRow; r <= lastRow; r++) {
      for (let c = firstCol; c <= lastCol; c++) {
        rows.push({
          pixel: { type: "uri", value: `p${r}:${c}` },
          month: { type: "literal", value: "--01" },
          value: { type: "literal", value: "0" },
          cell: { type: "uri", value: `Cell_${gridSize}_r${r}c${c}` },
        });
      }
    }
    return keepCellsInPolygon(rows, polygon, gridSize).length;
  }

  it("counts exactly the cells the polygon filter keeps", () => {
    expect(countCellsInPolygon(THIN_DIAGONAL, "5m")).toBe(cellsKeptByFilter(THIN_DIAGONAL, "5m"));
    expect(countCellsInPolygon(THIN_DIAGONAL, "10m")).toBe(cellsKeptByFilter(THIN_DIAGONAL, "10m"));
  });

  it("is checked against its box, which is what loading it reads", () => {
    const bounds = getPolygonBounds(THIN_DIAGONAL);
    expect(countCellsInPolygon(THIN_DIAGONAL, "5m")).toBeLessThan(FILTER_MAX_HEATMAP_CELLS);
    expect(countCellsInBounds(bounds, "5m")).toBeGreaterThan(FILTER_MAX_HEATMAP_CELLS);
    expect(isHeatmapCellLimitExceeded(bounds, "5m")).toBe(true);
    expect(isHeatmapCellLimitExceeded(bounds, "10m")).toBe(false);
  });
});
