import { FILTER_DEFAULTS } from "@/constants";
import type { TFilters } from "@/types";
import {
  getCanonicalFilterUrlParams,
  omitFilterParams,
  parseFilters,
  pickFilterParams,
  serializeFilters,
  withFilterParams,
} from "@/utils/filtersUrl.util";
import { describe, expect, it } from "vitest";

function parse(query: string) {
  return parseFilters(new URLSearchParams(query));
}

function serialize(overrides: Partial<TFilters>, base?: string) {
  return serializeFilters(
    { ...FILTER_DEFAULTS, ...overrides },
    new URLSearchParams(base),
  ).toString();
}

describe("parseFilters", () => {
  it("returns the defaults for an empty URL", () => {
    expect(parse("")).toEqual(FILTER_DEFAULTS);
  });

  it("reads every climate filter", () => {
    expect(parse("dataset=climate&period=c1961-1990&var=prec,tmax&grid=10m&months=7,1")).toEqual({
      ...FILTER_DEFAULTS,
      climatePeriod: "c1961-1990",
      variables: ["tmax", "prec"],
      gridSize: "10m",
      months: [1, 7],
    });
  });

  it("reads the weather year and periods", () => {
    const filters = parse("dataset=weather&year=1999&periods=2000,1990,1980");
    expect(filters.dataset).toBe("weather");
    expect(filters.weatherYear).toBe(1999);
    expect(filters.weatherPeriods).toEqual([2000, 1990, 1980]);
  });

  it("reads the compare climate periods", () => {
    const filters = parse("period1=c1951-1980&period2=c1981-2010");
    expect(filters.climatePeriodA).toBe("c1951-1980");
    expect(filters.climatePeriodB).toBe("c1981-2010");
  });

  it("falls back to defaults for invalid or unknown values, silently", () => {
    expect(
      parse("dataset=nope&period=c2050-2080&var=foo&grid=1km&months=13,0&period1=x&periods=a"),
    ).toEqual(FILTER_DEFAULTS);
    expect(parse("dataset=weather&year=1800").weatherYear).toBe(FILTER_DEFAULTS.weatherYear);
  });

  it("ignores values the URL's dataset doesn't use", () => {
    const climate = parse("dataset=climate&year=1999&periods=2000,1990");
    expect(climate.weatherYear).toBe(FILTER_DEFAULTS.weatherYear);
    expect(climate.weatherPeriods).toEqual(FILTER_DEFAULTS.weatherPeriods);

    const weather = parse("dataset=weather&period=c1961-1990&period1=c1951-1980");
    expect(weather.climatePeriod).toBe(FILTER_DEFAULTS.climatePeriod);
    expect(weather.climatePeriodA).toBe(FILTER_DEFAULTS.climatePeriodA);
  });

  it("accepts legacy year1/year2 when periods is absent", () => {
    expect(parse("dataset=weather&year1=2018&year2=2020").weatherPeriods).toEqual([2018, 2020]);
    expect(parse("dataset=weather&periods=2001,2002&year1=2018&year2=2020").weatherPeriods).toEqual(
      [2001, 2002],
    );
    expect(parse("dataset=weather&year1=2018").weatherPeriods).toEqual(
      FILTER_DEFAULTS.weatherPeriods,
    );
  });

  it("normalizes what it parses", () => {
    const filters = parse("dataset=weather&var=srad,tmin&grid=30s");
    expect(filters.variables).toEqual(["tmin"]);
    expect(filters.gridSize).toBe("2.5m");
  });

  it("parses existing exported links", () => {
    expect(
      parse(
        "city=Lviv&lat=49.8397&lng=24.0297&dataset=climate&var=tmax%2Ctmin%2Cprec&grid=10m&months=all&period1=c1970-2000&period2=c1991-2020",
      ),
    ).toEqual({ ...FILTER_DEFAULTS, gridSize: "10m" });
  });
});

describe("serializeFilters", () => {
  it("writes nothing for the defaults", () => {
    expect(serialize({})).toBe("");
  });

  it("writes only values that differ from the default", () => {
    expect(serialize({ gridSize: "10m", months: [1, 7] })).toBe("grid=10m&months=1%2C7");
  });

  it("writes the dataset's values only", () => {
    expect(serialize({ dataset: "weather", climatePeriod: "c1961-1990", weatherYear: 1999 })).toBe(
      "dataset=weather&year=1999",
    );
    expect(serialize({ weatherYear: 1999, climatePeriodA: "c1951-1980" })).toBe(
      "period1=c1951-1980",
    );
  });

  it("keeps page params and replaces filter params, including legacy ones", () => {
    expect(
      serialize(
        { dataset: "weather", weatherPeriods: [2001, 2002] },
        "city=Lviv&grid=10m&year1=2018&year2=2020&chart=standard",
      ),
    ).toBe("city=Lviv&chart=standard&dataset=weather&periods=2001%2C2002");
  });

  it("normalizes before writing", () => {
    expect(serialize({ dataset: "weather", variables: ["srad"], gridSize: "30s" })).toBe(
      "dataset=weather",
    );
  });

  it("round-trips through parseFilters", () => {
    const filters: TFilters = {
      ...FILTER_DEFAULTS,
      dataset: "weather",
      weatherYear: 1990,
      variables: ["prec"],
      gridSize: "5m",
      months: [3, 4],
      weatherPeriods: [1960, 2010, 1985],
    };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });
});

describe("omitFilterParams", () => {
  it("keeps only page params, legacy filter params dropped too", () => {
    expect(
      omitFilterParams(
        new URLSearchParams("city=Lviv&dataset=weather&year1=2018&chart=standard&var=tmax"),
      ).toString(),
    ).toBe("city=Lviv&chart=standard");
  });
});

describe("withFilterParams", () => {
  it("puts the source's canonical filters after the page params", () => {
    expect(
      withFilterParams(
        new URLSearchParams("city=Oslo&layout=overlay"),
        new URLSearchParams("city=Lviv&months=7,1&grid=10m&var=tmax,tmin,prec"),
      ).toString(),
    ).toBe("city=Oslo&layout=overlay&grid=10m&months=1%2C7");
  });
});

describe("pickFilterParams", () => {
  it("keeps only canonical filter params", () => {
    expect(
      pickFilterParams(
        new URLSearchParams("city=Lviv&grid=10m&months=all&layout=overlay"),
      ).toString(),
    ).toBe("grid=10m");
  });
});

describe("getCanonicalFilterUrlParams", () => {
  it("is null for a canonical URL, whatever the param order", () => {
    expect(
      getCanonicalFilterUrlParams(new URLSearchParams("months=1&city=Lviv&grid=10m")),
    ).toBeNull();
    expect(getCanonicalFilterUrlParams(new URLSearchParams(""))).toBeNull();
  });

  it("drops written-out defaults, invalid values and legacy params", () => {
    expect(
      getCanonicalFilterUrlParams(
        new URLSearchParams("city=Lviv&dataset=climate&months=all&grid=1km"),
      )?.toString(),
    ).toBe("city=Lviv");
    expect(
      getCanonicalFilterUrlParams(
        new URLSearchParams("dataset=weather&year1=2018&year2=2020"),
      )?.toString(),
    ).toBe("dataset=weather&periods=2018%2C2020");
  });

  it("rewrites values normalization changed", () => {
    expect(
      getCanonicalFilterUrlParams(new URLSearchParams("var=prec,tmax&months=7,1"))?.toString(),
    ).toBe("var=tmax%2Cprec&months=1%2C7");
    expect(
      getCanonicalFilterUrlParams(
        new URLSearchParams("period1=c1981-2010&period2=c1981-2010"),
      )?.toString(),
    ).toBe("");
  });
});

// * each view's own params, which the filter params must travel alongside untouched
const VIEW_PAGE_PARAMS = {
  climateStatistics: "city=Lviv&lat=49.8397&lng=24.0297&chart=standard",
  compareCities:
    "cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522&layout=overlay",
  comparePeriods: "city=Lviv&lat=49.8397&lng=24.0297&expanded=a&wlShading=b",
  heatMap: "polygon=10%2C20%3B11%2C21%3B12%2C20",
} as const;

// * normalized, with the other dataset's values at their defaults — what parseFilters returns
const NORMALIZED_FILTERS: Record<string, TFilters> = {
  climateDefaults: FILTER_DEFAULTS,
  climateFull: {
    ...FILTER_DEFAULTS,
    climatePeriod: "c1970-2000",
    variables: ["tmax", "srad", "wind"],
    gridSize: "30s",
    months: [6, 7, 8],
  },
  climateCompare: {
    ...FILTER_DEFAULTS,
    climatePeriod: "c1961-1990",
    variables: ["prec"],
    gridSize: "10m",
    climatePeriodA: "c1991-2020",
    climatePeriodB: "c1951-1980",
  },
  weatherDefaults: { ...FILTER_DEFAULTS, dataset: "weather" },
  weatherFull: {
    ...FILTER_DEFAULTS,
    dataset: "weather",
    weatherYear: 1951,
    variables: ["tmin", "prec"],
    gridSize: "5m",
    months: [12],
    weatherPeriods: [1951, 2024, 1990, 2000, 2010],
  },
};

// * hand-edited / legacy / non-canonical filter queries
const MESSY_FILTER_QUERIES = [
  "dataset=climate&months=all&var=tmax,tmin,prec&grid=2.5m",
  "dataset=weather&year1=2018&year2=2020&grid=30s&var=srad",
  "period=c1991-2020&var=wind,prec,prec&months=7,1,7",
  "period1=c1981-2010&period2=c1981-2010&dataset=nope",
  "dataset=weather&periods=2000,2000,1800&year=3000&period=c1961-1990",
  "months=1,2,3,4,5,6,7,8,9,10,11,12&var=&grid=",
];

describe.each(Object.entries(VIEW_PAGE_PARAMS))("round trip on %s", (_view, pageParams) => {
  it.each(Object.entries(NORMALIZED_FILTERS))(
    "parseFilters(serializeFilters(f)) equals f for %s",
    (_name, filters) => {
      const params = serializeFilters(filters, new URLSearchParams(pageParams));
      expect(parseFilters(params)).toEqual(filters);
    },
  );

  it.each(Object.entries(NORMALIZED_FILTERS))("keeps the page params for %s", (_name, filters) => {
    const params = serializeFilters(filters, new URLSearchParams(pageParams));
    new URLSearchParams(pageParams).forEach((value, name) => {
      expect(params.get(name)).toBe(value);
    });
  });

  it.each(Object.entries(NORMALIZED_FILTERS))(
    "reports a serialized URL as canonical for %s",
    (_name, filters) => {
      const params = serializeFilters(filters, new URLSearchParams(pageParams));
      expect(getCanonicalFilterUrlParams(params)).toBeNull();
    },
  );

  it.each(MESSY_FILTER_QUERIES)("canonicalizes %s once, then reports no change", (query) => {
    const params = new URLSearchParams(`${pageParams}&${query}`);
    const canonical = getCanonicalFilterUrlParams(params) ?? params;
    expect(getCanonicalFilterUrlParams(canonical)).toBeNull();
    expect(parseFilters(canonical)).toEqual(parseFilters(params));
  });
});
