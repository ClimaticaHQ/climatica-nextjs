import { COMPARE_CITIES_URL_SCHEMA } from "@/app/compare-cities/_components/CompareCities.constant";
import { parseUrlState } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

describe("compare-cities URL schema", () => {
  it("parses an existing exported link", () => {
    const params = new URLSearchParams(
      "cityA=Lviv&latA=49.8397&lngA=24.0297&cityB=Madrid&latB=40.4168&lngB=-3.7038&dataset=climate&var=tmax%2Ctmin%2Cprec&grid=10m&period=c1970-2000",
    );
    expect(parseUrlState(COMPARE_CITIES_URL_SCHEMA, params)).toEqual({
      cityA: {
        id: "url:49.8397,24.0297",
        label: "Lviv",
        description: "",
        lat: 49.8397,
        lng: 24.0297,
      },
      cityB: {
        id: "url:40.4168,-3.7038",
        label: "Madrid",
        description: "",
        lat: 40.4168,
        lng: -3.7038,
      },
      datasetPeriod: { dataset: "climate", climatePeriod: "c1970-2000" },
      variables: ["tmax", "tmin", "prec"],
      gridSize: "10m",
    });
  });
});
