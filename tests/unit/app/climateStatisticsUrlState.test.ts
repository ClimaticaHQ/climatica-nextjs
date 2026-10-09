import { CLIMATE_STATISTICS_URL_SCHEMA } from "@/app/climate-statistics/_components/ClimateStatistics.constant";
import { FILTER_DEFAULTS } from "@/constants";
import { parseFilters } from "@/utils/filtersUrl.util";
import { parseUrlState } from "@/utils/urlParams.util";
import { describe, expect, it } from "vitest";

describe("climate-statistics URL", () => {
  const params = new URLSearchParams(
    "city=Helsinki&lat=60.1695&lng=24.9354&dataset=climate&var=tmax%2Ctmin%2Cprec&grid=2.5m&months=all&period=c1961-1990",
  );

  it("parses an existing exported link's page state", () => {
    expect(parseUrlState(CLIMATE_STATISTICS_URL_SCHEMA, params)).toEqual({
      city: {
        id: "url:60.1695,24.9354",
        label: "Helsinki",
        description: "",
        lat: 60.1695,
        lng: 24.9354,
      },
    });
  });

  it("parses an existing exported link's filters", () => {
    expect(parseFilters(params)).toEqual({ ...FILTER_DEFAULTS, climatePeriod: "c1961-1990" });
  });
});
