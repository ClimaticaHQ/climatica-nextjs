import { BENCHMARK_GRIDS } from "../../../scripts/benchmark/benchmark.constant";
import type { TMeasurement, TPairResult, TPlace } from "../../../scripts/benchmark/benchmark.type";
import {
  buildTargets,
  endpointOf,
  exclusionOf,
  invalidReason,
  parseGrids,
  readContent,
} from "../../../scripts/benchmark/benchmark.util";
import { latexEscape, toLatex } from "../../../scripts/benchmark/benchmarkOutput.util";
import {
  placeOf,
  summarizePlaces,
  toPlacesLatex,
} from "../../../scripts/benchmark/benchmarkPlaces.util";
import { findCoverageIssues, summarize } from "../../../scripts/benchmark/benchmarkSummary.util";
import { buildGridIri } from "@/utils/worldclim.util";
import { describe, expect, it } from "vitest";

const BASE = "http://localhost:3000";
const VARS =
  "var=http:%2F%2Fclimate.gsic.uva.es%2Fdata%2FVariable_tmax&var=http:%2F%2Fclimate.gsic.uva.es%2Fdata%2FVariable_prec";
const pointUrl = (lat: number, lng: number) =>
  `/api/worldclim/pixelvaluesofapoint?lat=${lat}&lng=${lng}&grid=${encodeURIComponent(buildGridIri("2.5m"))}&${VARS}&isClimate=true`;

const place = (overrides: Partial<TPlace>): TPlace => ({
  name: "Inland",
  country: "Spain",
  continent: "Europe",
  lat: 50.04,
  lng: 10.04,
  geonameid: 1,
  searchQuery: "Inland",
  sample: "original",
  ...overrides,
});

const PLACES = [
  place({}),
  place({ name: "Edge", lat: 50, searchQuery: "Edge", sample: "added" }),
  place({ name: "Lviv", lat: 49.83826, lng: 24.02324, searchQuery: "Львів" }),
];

describe("endpointOf", () => {
  it("names the upstream call from the proxied path", () => {
    expect(endpointOf(`${BASE}/api/worldclim/pixelvaluesofapoint?lat=1`)).toBe(
      "SCRAPI pixelvaluesofapoint",
    );
    expect(endpointOf(`${BASE}/api/worldclim/cellofpoint?lat=1`)).toBe("SCRAPI cellofpoint");
    expect(endpointOf(`${BASE}/api/worldclim/resource?id=Cell`)).toBe("SCRAPI resource");
    expect(endpointOf(`${BASE}/api/cities?q=rome`)).toBe("Solr city search");
    expect(endpointOf(`${BASE}/api/cities?q=49.9818,36.2548&lang=en`)).toBe("Solr nearest city");
  });
});

describe("parseGrids", () => {
  it("runs every grid by default, coarsest first", () => {
    expect(parseGrids(undefined, ",")).toEqual([...BENCHMARK_GRIDS]);
    expect(parseGrids(" 30s,10m ", ",")).toEqual(["30s", "10m"]);
  });

  it("refuses a grid the benchmark doesn't know", () => {
    expect(() => parseGrids("10m,1m", ",")).toThrow(/1m/);
  });
});

describe("buildTargets", () => {
  // * 50.04 / 10.04 lies well inside a cell at every grid; latitude 50 is an edge at every grid
  const files = [
    { name: "climate", urls: [pointUrl(50.04, 10.04), pointUrl(50, 10.04)] },
    { name: "cells", urls: ["/api/worldclim/cellofpoint?lat=50.04&lng=10.04"] },
  ];
  const targets = buildTargets({ files, base: BASE, grids: [...BENCHMARK_GRIDS], places: PLACES });

  it("runs a URL with a grid once per grid, changing only the grid", () => {
    const climate = targets.filter((t) => t.file === "climate" && t.url.includes("lat=50.04&"));
    expect(climate.map((target) => target.grid)).toEqual([...BENCHMARK_GRIDS]);
    expect(climate.map((target) => new URL(target.url).searchParams.get("grid"))).toEqual(
      BENCHMARK_GRIDS.map((grid) => buildGridIri(grid)),
    );
    for (const target of climate) {
      const params = new URL(target.url).searchParams;
      expect(params.getAll("var")).toHaveLength(2);
      expect(params.get("isClimate")).toBe("true");
    }
  });

  it("runs a URL without a grid once, with no resolution", () => {
    const cells = targets.filter((target) => target.file === "cells");
    expect(cells).toHaveLength(1);
    expect(cells[0]).toMatchObject({ grid: null, endpoint: "SCRAPI cellofpoint", place: "Inland" });
  });

  it("predicts BYPASS by the app's own edge rule", () => {
    const inside = targets.filter((target) => target.url.includes("lat=50.04&"));
    const onEdge = targets.filter((target) => target.url.includes("lat=50&"));
    expect(inside.every((target) => !target.isPredictedBypass)).toBe(true);
    expect(onEdge.map((target) => target.isPredictedBypass)).toEqual([true, true, true, true]);
    expect(onEdge.every((target) => target.place === "Edge")).toBe(true);
  });
});

describe("placeOf", () => {
  it("finds the city by its point, its rounded coordinate query or its search query", () => {
    expect(placeOf(`${BASE}/api/worldclim/cellofpoint?lat=49.83826&lng=24.02324`, PLACES)).toBe(
      "Lviv",
    );
    expect(placeOf(`${BASE}/api/cities?q=49.8383,24.0232&lang=en`, PLACES)).toBe("Lviv");
    expect(placeOf(`${BASE}/api/cities?q=%D0%9B%D1%8C%D0%B2%D1%96%D0%B2&lang=en`, PLACES)).toBe(
      "Lviv",
    );
    expect(placeOf(`${BASE}/api/cities?q=Nowhere&lang=en`, PLACES)).toBeNull();
  });
});

describe("readContent", () => {
  const binding = (period: string, variable: string) => ({
    raster: { value: `http://climate.gsic.uva.es/data/Raster_10m_${variable}_${period}` },
    var: { value: `http://climate.gsic.uva.es/data/Variable_${variable}` },
  });

  it("counts the bindings and the periods and variables they cover", () => {
    const body = JSON.stringify({
      results: {
        bindings: [
          binding("c1970-2000", "tmax"),
          binding("c1961-1990", "prec"),
          binding("c1970-2000", "tmax"),
        ],
      },
    });
    expect(readContent(body)).toEqual({
      bindings: 3,
      periods: ["c1961-1990", "c1970-2000"],
      variables: ["prec", "tmax"],
      isEmpty: false,
    });
  });

  it("an answer without bindings, or an empty list, is empty", () => {
    expect(readContent(JSON.stringify({ results: { bindings: [] } }))).toMatchObject({
      bindings: 0,
      isEmpty: true,
    });
    expect(readContent("[]")).toMatchObject({ bindings: null, isEmpty: true });
    expect(readContent("<html>")).toMatchObject({ bindings: null, isEmpty: false });
  });
});

const response = (overrides: Partial<TMeasurement>): TMeasurement => ({
  ms: 100,
  status: 200,
  xCache: "MISS",
  serverTiming: "",
  upstreamMs: null,
  bytes: 1000,
  bindings: 36,
  periods: ["c1970-2000"],
  variables: ["prec", "tmax", "tmin"],
  isEmpty: false,
  error: null,
  ...overrides,
});

type TPairArgs = {
  cold?: Partial<TMeasurement>;
  warm?: Partial<TMeasurement>;
  isPredictedBypass?: boolean;
  where?: string;
};

function pair({ cold = {}, warm = {}, isPredictedBypass = false, where = "Inland" }: TPairArgs) {
  const base = {
    run: 1,
    file: "climate",
    url: `${BASE}/api/worldclim/pixelvaluesofapoint`,
    endpoint: "SCRAPI pixelvaluesofapoint",
    grid: "10m",
    isPredictedBypass,
    place: where,
    cold: response(cold),
    warm: response({ xCache: "HIT", ...warm }),
  };
  const withReason = { ...base, reason: invalidReason(base), exclusion: null };
  return { ...withReason, exclusion: exclusionOf(withReason) } satisfies TPairResult;
}

const EMPTY = { bindings: 0, isEmpty: true, periods: [], variables: [] };

describe("exclusion reasons", () => {
  it("names why a pair is left out: error, near an edge, no data, else other", () => {
    expect(pair({}).exclusion).toBeNull();
    expect(pair({ cold: { status: 502 } }).exclusion).toBe("error");
    expect(pair({ warm: { error: "refused" } }).exclusion).toBe("error");
    expect(pair({ cold: { xCache: "BYPASS" }, warm: { xCache: "BYPASS" } }).exclusion).toBe(
      "nearEdge",
    );
    // * an empty answer is never cached, so warm is MISS again
    expect(pair({ cold: EMPTY, warm: { ...EMPTY, xCache: "MISS" } }).exclusion).toBe("noData");
    expect(pair({ cold: { xCache: "HIT" } }).exclusion).toBe("other");
  });
});

describe("summarize", () => {
  const pairs = [
    pair({ cold: { ms: 100, upstreamMs: 80 }, warm: { ms: 10 } }),
    pair({ cold: { ms: 200, upstreamMs: 100 }, warm: { ms: 20 } }),
    pair({ cold: { xCache: "BYPASS" }, warm: { xCache: "BYPASS" }, isPredictedBypass: true }),
    pair({ cold: { status: 502 } }),
    pair({ cold: EMPTY, warm: { ...EMPTY, xCache: "MISS" } }),
    // * BYPASS the app's rule didn't predict
    pair({ cold: { xCache: "BYPASS" }, warm: { xCache: "BYPASS" } }),
  ];
  const [summary] = summarize(pairs);

  it("keeps cold MISS → warm HIT pairs and counts the rest by reason", () => {
    expect(summary).toMatchObject({
      validPairs: 2,
      totalPairs: 6,
      excludedNearEdge: 2,
      excludedNoData: 1,
      excludedError: 1,
      excludedOther: 0,
      bypassMismatches: 1,
    });
  });

  it("medians, speed-up and the upstream call's share of the uncached time", () => {
    expect(summary?.cold?.median).toBe(150);
    expect(summary?.warm?.median).toBe(15);
    expect(summary?.speedUp).toBe(10);
    expect(summary?.upstreamMedianMs).toBe(90);
    // * 80/100 and 100/200
    expect(summary?.upstreamShareMedian).toBeCloseTo(0.65);
    expect(summary?.periods).toEqual(["c1970-2000"]);
  });

  it("one row per endpoint and resolution", () => {
    const other = { ...pair({}), grid: "30s" };
    expect(summarize([...pairs, other]).map((row) => row.grid)).toEqual(["10m", "30s"]);
  });
});

describe("findCoverageIssues", () => {
  it("reports a city whose answer was empty or short of the full ones, with what's missing", () => {
    const issues = findCoverageIssues([
      pair({}),
      pair({ where: "Island", cold: EMPTY, warm: { ...EMPTY, xCache: "MISS" } }),
      pair({ where: "Coast", cold: { bindings: 24, variables: ["prec", "tmax"] } }),
    ]);
    expect(issues).toEqual([
      expect.objectContaining({ place: "Island", bindings: [0], expectedBindings: 36 }),
      expect.objectContaining({ place: "Coast", bindings: [24], missingVariables: ["tmin"] }),
    ]);
  });
});

describe("places", () => {
  const summary = summarizePlaces([
    place({ name: "Zurich", country: "Switzerland" }),
    place({ name: "Berlin", country: "Germany", lat: 52.5 }),
    place({
      name: "Auckland",
      country: "New Zealand",
      continent: "Oceania",
      lat: -36.8,
      lng: 174.8,
    }),
    place({
      name: "São Paulo",
      country: "Brazil",
      continent: "South America",
      lat: -23.5,
      lng: -46.6,
    }),
  ]);

  it("counts cities per continent and hemisphere, and the latitude range", () => {
    expect(summary).toMatchObject({
      total: 4,
      perContinent: { Europe: 2, Oceania: 1, "South America": 1, Asia: 0 },
      northern: 2,
      southern: 2,
      eastern: 3,
      western: 1,
      minLat: { place: "Auckland", lat: -36.8 },
      maxLat: { place: "Berlin", lat: 52.5 },
    });
  });

  it("writes the footnote: cities with their country, by continent, alphabetical", () => {
    const tex = toPlacesLatex(
      [
        place({ name: "Zurich", country: "Switzerland" }),
        place({ name: "Berlin", country: "Germany" }),
      ],
      summary,
    );
    expect(tex).toContain("Europe: Berlin (Germany), Zurich (Switzerland); Asia: ;");
    expect(tex).toContain("from 36.80\\textdegree{}S (Auckland) to 52.50\\textdegree{}N (Berlin)");
  });
});

describe("LaTeX", () => {
  it("escapes the characters LaTeX treats specially", () => {
    expect(latexEscape("a_b & 5% #1")).toBe("a\\_b \\& 5\\% \\#1");
  });

  it("writes a row per endpoint and resolution: exclusions by reason, the upstream share", () => {
    const tex = toLatex(
      summarize([pair({ cold: { ms: 100, upstreamMs: 80 }, warm: { ms: 10 } })]),
      5,
    );
    expect(tex).toContain(
      "SCRAPI pixelvaluesofapoint & 10$'$ & 1 & 0 & 0 & 0 & 0 & 100.0 & 100.0 & 10.0 & 10.0 & 10.0$\\times$ & 80\\% \\\\",
    );
    expect(tex).toContain("\\begin{tabular}{llrrr}");
  });
});
