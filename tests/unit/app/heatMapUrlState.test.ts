import { HEAT_MAP_URL_SCHEMA } from "@/app/heat-map/_components/HeatMap.constant";
import { FILTER_DEFAULTS } from "@/constants";
import { parseFilters } from "@/utils/filtersUrl.util";
import { parseUrlState } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

describe("heat-map URL", () => {
  it("parses an existing bbox-selection exported link", () => {
    const params = new URLSearchParams(
      "dataset=climate&var=tmax&grid=10m&period=c1970-2000&north=50&south=49&west=23&east=24",
    );
    expect(parseUrlState(HEAT_MAP_URL_SCHEMA, params)).toEqual({
      selection: { kind: "bbox", bbox: { north: 50, south: 49, west: 23, east: 24 } },
    });
    expect(parseFilters(params)).toEqual({
      ...FILTER_DEFAULTS,
      variables: ["tmax"],
      gridSize: "10m",
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
    expect(parseUrlState(HEAT_MAP_URL_SCHEMA, params).selection?.kind).toBe("polygon");
    const filters = parseFilters(params);
    expect(filters.dataset).toBe("weather");
    expect(filters.weatherYear).toBe(2020);
  });

  it("parses a link with no selection at all", () => {
    const params = new URLSearchParams("dataset=climate&var=tmax&grid=10m&period=c1970-2000");
    expect(parseUrlState(HEAT_MAP_URL_SCHEMA, params).selection).toEqual({ kind: "none" });
  });
});
