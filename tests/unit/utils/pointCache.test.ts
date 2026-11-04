import { describe, expect, it } from "vitest";

import { buildPointCacheParts, isAnswerForCells, pointToCell } from "@/utils";

const D = "http://climate.gsic.uva.es/data/";
const TROMSO = { lat: 69.6492, lng: 18.9553 };

function pixelParams(point: { lat: number; lng: number }, extra = "isClimate=true") {
  return new URLSearchParams(
    `lat=${point.lat}&lng=${point.lng}&grid=${encodeURIComponent(`${D}Grid_10m`)}` +
      `&var=${encodeURIComponent(`${D}Variable_tmax`)}&var=${encodeURIComponent(`${D}Variable_prec`)}&${extra}`,
  );
}

describe("pointToCell", () => {
  // * the cells SCRAPI's cellofpoint answered for these points
  it.each([
    ["10m", 122, 1193],
    ["5m", 244, 2387],
    ["2.5m", 488, 4774],
    ["30s", 2442, 23874],
  ] as const)("puts Tromsø in SCRAPI's %s cell", (size, row, col) => {
    expect(pointToCell(TROMSO, size)).toEqual({ size, row, col });
  });

  it("matches SCRAPI south of the equator and west of Greenwich", () => {
    expect(pointToCell({ lat: -33.8688, lng: 151.2093 }, "10m")).toEqual({
      size: "10m",
      row: 743,
      col: 1987,
    });
    expect(pointToCell({ lat: -0.1807, lng: -78.4678 }, "30s")).toEqual({
      size: "30s",
      row: 10821,
      col: 12183,
    });
  });

  it.each([
    { lat: 45, lng: 10.08 },
    { lat: 45.0001, lng: 10.08 },
    { lat: 45.08, lng: 9.9999 },
  ])("refuses a point near a cell edge: %j", (point) => {
    expect(pointToCell(point, "10m")).toBeNull();
  });

  it("accepts a point just past the edge margin", () => {
    expect(pointToCell({ lat: 45.001, lng: 10.001 }, "10m")).toEqual({
      size: "10m",
      row: 269,
      col: 1140,
    });
  });

  it.each([
    { lat: -90, lng: 0.1 },
    { lat: 0.1, lng: 180 },
    { lat: 95, lng: 0.1 },
  ])("refuses a point outside the grid: %j", (point) => {
    expect(pointToCell(point, "10m")).toBeNull();
  });
});

describe("buildPointCacheParts — pixelvaluesofapoint", () => {
  it("keys by grid, cell, sorted variables and dataset", () => {
    expect(buildPointCacheParts("pixelvaluesofapoint", pixelParams(TROMSO))).toMatchObject({
      queryId: "pixelvaluesofapoint",
      cell: { size: "10m", row: 122, col: 1193 },
      variant: "prec,tmax:climate",
    });
  });

  it("gives two points in one cell the same parts, and a neighbouring cell other parts", () => {
    const a = buildPointCacheParts("pixelvaluesofapoint", pixelParams({ lat: 69.62, lng: 18.85 }));
    const b = buildPointCacheParts("pixelvaluesofapoint", pixelParams({ lat: 69.55, lng: 18.98 }));
    const n = buildPointCacheParts("pixelvaluesofapoint", pixelParams({ lat: 69.6, lng: 19.1 }));
    expect(a).toEqual(b);
    expect(n?.cell).not.toEqual(a?.cell);
  });

  it("ignores the order of the variables", () => {
    const reversed = new URLSearchParams(
      `lat=69.6492&lng=18.9553&grid=${encodeURIComponent(`${D}Grid_10m`)}` +
        `&var=${encodeURIComponent(`${D}Variable_prec`)}&var=${encodeURIComponent(`${D}Variable_tmax`)}&isClimate=true`,
    );
    expect(buildPointCacheParts("pixelvaluesofapoint", reversed)).toEqual(
      buildPointCacheParts("pixelvaluesofapoint", pixelParams(TROMSO)),
    );
  });

  it("names the weather year", () => {
    const parts = buildPointCacheParts(
      "pixelvaluesofapoint",
      pixelParams(TROMSO, "isWeather=true&year=2020"),
    );
    expect(parts?.variant).toBe("prec,tmax:weather:2020");
  });

  it.each([
    ["an unknown param", "isClimate=true&foo=1"],
    ["both datasets", "isClimate=true&isWeather=true&year=2020"],
    ["no dataset", "x=1"],
    ["weather without a year", "isWeather=true"],
    ["a year on climate", "isClimate=true&year=2020"],
    ["a repeated lat", "isClimate=true&lat=1"],
  ])("refuses %s", (_, extra) => {
    expect(buildPointCacheParts("pixelvaluesofapoint", pixelParams(TROMSO, extra))).toBeNull();
  });

  it("refuses an unknown grid", () => {
    const params = pixelParams(TROMSO);
    params.set("grid", `${D}Grid_1m`);
    expect(buildPointCacheParts("pixelvaluesofapoint", params)).toBeNull();
  });
});

describe("buildPointCacheParts — cellofpoint", () => {
  it("keys by the 30 s cell and expects one cell per grid", () => {
    const parts = buildPointCacheParts(
      "cellofpoint",
      new URLSearchParams("lat=69.6492&lng=18.9553"),
    );
    expect(parts?.cell).toEqual({ size: "30s", row: 2442, col: 23874 });
    expect(parts?.variant).toBeNull();
    expect(parts?.expectedCells).toHaveLength(4);
  });

  it("refuses a point near any grid's edge, and extra params", () => {
    expect(
      buildPointCacheParts("cellofpoint", new URLSearchParams("lat=45&lng=10.004")),
    ).toBeNull();
    expect(
      buildPointCacheParts("cellofpoint", new URLSearchParams("lat=69.6492&lng=18.9553&grid=x")),
    ).toBeNull();
  });

  it("leaves other query ids alone", () => {
    expect(
      buildPointCacheParts("pixelvaluesinbox", new URLSearchParams("lat=69.6492&lng=18.9553")),
    ).toBeNull();
  });
});

describe("isAnswerForCells", () => {
  const cell = { size: "10m", row: 122, col: 1193 } as const;
  const answer = (iri: string) => ({
    results: { bindings: [{ cell: { type: "uri", value: iri } }] },
  });

  it("accepts an answer naming the expected cell", () => {
    expect(isAnswerForCells(answer(`${D}Cell_10m_r122c1193`), [cell])).toBe(true);
  });

  it("rejects another cell, an empty answer and a malformed one", () => {
    expect(isAnswerForCells(answer(`${D}Cell_10m_r122c1194`), [cell])).toBe(false);
    expect(isAnswerForCells({ results: { bindings: [] } }, [cell])).toBe(false);
    expect(isAnswerForCells({ error: "x" }, [cell])).toBe(false);
  });
});
