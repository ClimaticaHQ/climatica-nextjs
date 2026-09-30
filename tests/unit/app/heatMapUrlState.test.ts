import { HEAT_MAP_URL_SCHEMA } from "@/app/heat-map/_components/HeatMap.constant";
import { parseUrlState } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

describe("heat-map URL schema", () => {
  it("parses an existing bbox-selection exported link", () => {
    const params = new URLSearchParams(
      "dataset=climate&var=tmax&grid=10m&period=c1970-2000&north=50&south=49&west=23&east=24",
    );
    expect(parseUrlState(HEAT_MAP_URL_SCHEMA, params)).toEqual({
      datasetPeriod: { dataset: "climate", climatePeriod: "c1970-2000" },
      variables: ["tmax"],
      gridSize: "10m",
      selection: { kind: "bbox", bbox: { north: 50, south: 49, west: 23, east: 24 } },
    });
  });

  it("parses an existing polygon-selection exported link", () => {
    const wkt =
      "POLYGON((24.00000 49.00000, 24.50000 49.00000, 24.25000 49.50000, 24.00000 49.00000))";
    const params = new URLSearchParams({
      dataset: "weather",
      var: "prec",
      grid: "2.5m",
      year: "2020",
      polygon: wkt,
    });
    const parsed = parseUrlState(HEAT_MAP_URL_SCHEMA, params);
    expect(parsed.datasetPeriod).toEqual({ dataset: "weather", weatherYear: 2020 });
    expect(parsed.selection?.kind).toBe("polygon");
  });

  it("parses a link with no selection at all", () => {
    const params = new URLSearchParams("dataset=climate&var=tmax&grid=10m&period=c1970-2000");
    expect(parseUrlState(HEAT_MAP_URL_SCHEMA, params).selection).toEqual({ kind: "none" });
  });
});
