import {
  cityUrlField,
  datasetPeriodUrlField,
  gridSizeUrlField,
  monthsUrlField,
  variablesUrlField,
} from "@/utils/urlFields.util";
import { describe, expect, it } from "vitest";

describe("cityUrlField", () => {
  const field = cityUrlField({ name: "city", lat: "lat", lng: "lng" });

  it("serializes a trimmed label and lat/lng to 4 decimal places", () => {
    const params = new URLSearchParams();
    field.serialize(
      { id: "x", label: " Rome ", description: "", lat: 41.9028, lng: 12.4964 },
      params,
    );
    expect(params.get("city")).toBe("Rome");
    expect(params.get("lat")).toBe("41.9028");
    expect(params.get("lng")).toBe("12.4964");
  });

  it("parses lat/lng back to numbers and returns a full TCity", () => {
    const params = new URLSearchParams("city=Rome&lat=41.9028&lng=12.4964");
    expect(field.parse(params)).toEqual({
      id: "url:41.9028,12.4964",
      label: "Rome",
      description: "",
      lat: 41.9028,
      lng: 12.4964,
    });
  });

  it("falls back to a lat,lng label when the name is missing", () => {
    const params = new URLSearchParams("lat=41.9028&lng=12.4964");
    expect(field.parse(params)?.label).toBe("41.9028, 12.4964");
  });

  it("returns undefined when lat or lng is missing", () => {
    const params = new URLSearchParams("city=Rome&lat=41.9028");
    expect(field.parse(params)).toBeUndefined();
  });

  it("uses whichever param names it was configured with", () => {
    const fieldB = cityUrlField({ name: "cityB", lat: "latB", lng: "lngB" });
    const params = new URLSearchParams();
    fieldB.serialize(
      { id: "x", label: "Oslo", description: "", lat: 59.9139, lng: 10.7522 },
      params,
    );
    expect(params.get("cityB")).toBe("Oslo");
    expect(params.has("city")).toBe(false);
  });
});

describe("datasetPeriodUrlField", () => {
  it("climate mode writes dataset + period, not year", () => {
    const params = new URLSearchParams();
    datasetPeriodUrlField.serialize({ dataset: "climate", climatePeriod: "c1970-2000" }, params);
    expect(params.get("dataset")).toBe("climate");
    expect(params.get("period")).toBe("c1970-2000");
    expect(params.has("year")).toBe(false);
  });

  it("weather mode writes dataset + year, not period", () => {
    const params = new URLSearchParams();
    datasetPeriodUrlField.serialize({ dataset: "weather", weatherYear: 2020 }, params);
    expect(params.get("dataset")).toBe("weather");
    expect(params.get("year")).toBe("2020");
    expect(params.has("period")).toBe(false);
  });

  it("round-trips climate mode", () => {
    const params = new URLSearchParams();
    datasetPeriodUrlField.serialize({ dataset: "climate", climatePeriod: "c1991-2020" }, params);
    expect(datasetPeriodUrlField.parse(params)).toEqual({
      dataset: "climate",
      climatePeriod: "c1991-2020",
    });
  });

  it("round-trips weather mode", () => {
    const params = new URLSearchParams();
    datasetPeriodUrlField.serialize({ dataset: "weather", weatherYear: 2015 }, params);
    expect(datasetPeriodUrlField.parse(params)).toEqual({ dataset: "weather", weatherYear: 2015 });
  });

  it("returns undefined when dataset is missing or invalid", () => {
    expect(datasetPeriodUrlField.parse(new URLSearchParams())).toBeUndefined();
  });
});

describe("variablesUrlField", () => {
  it("round-trips a variable list", () => {
    const params = new URLSearchParams();
    variablesUrlField.serialize(["tmax", "tmin"], params);
    expect(params.get("var")).toBe("tmax,tmin");
    expect(variablesUrlField.parse(params)).toEqual(["tmax", "tmin"]);
  });

  it("returns undefined when var is missing", () => {
    expect(variablesUrlField.parse(new URLSearchParams())).toBeUndefined();
  });
});

describe("gridSizeUrlField", () => {
  it("round-trips a grid size", () => {
    const params = new URLSearchParams();
    gridSizeUrlField.serialize("10m", params);
    expect(gridSizeUrlField.parse(params)).toBe("10m");
  });

  it("returns undefined for an invalid grid size", () => {
    const params = new URLSearchParams("grid=bogus");
    expect(gridSizeUrlField.parse(params)).toBeUndefined();
  });
});

describe("monthsUrlField", () => {
  it('round-trips "all"', () => {
    const params = new URLSearchParams();
    monthsUrlField.serialize("all", params);
    expect(monthsUrlField.parse(params)).toBe("all");
  });

  it("round-trips a partial month list", () => {
    const params = new URLSearchParams();
    monthsUrlField.serialize([6, 7, 8], params);
    expect(monthsUrlField.parse(params)).toEqual([6, 7, 8]);
  });

  it("canonicalizes an empty array to all", () => {
    const params = new URLSearchParams();
    monthsUrlField.serialize([], params);
    expect(params.get("months")).toBe("all");
  });

  it("canonicalizes a full 12-month list to all", () => {
    const params = new URLSearchParams();
    monthsUrlField.serialize(
      Array.from({ length: 12 }, (_, i) => i + 1),
      params,
    );
    expect(params.get("months")).toBe("all");
  });
});
