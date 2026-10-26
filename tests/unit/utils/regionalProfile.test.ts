import { computeRegionalProfile } from "@/app/heat-map/_components/HeatMap.util";
import type { TWorldClimAvgBoxBinding } from "@/types";
import { getPolygonBounds, getWktBounds } from "@/utils/cellCount.util";
import { summarizeMonths } from "@/utils/walterLieth.util";
import { describe, expect, it } from "vitest";

const TMAX = [8, 10, 14, 17, 22, 28, 32, 31, 26, 19, 12, 9];
const TMIN = [0, 1, 3, 5, 9, 14, 17, 17, 13, 9, 4, 1];
const PREC = [40, 35, 30, 45, 40, 20, 10, 10, 25, 50, 55, 50];

function avgBinding(values: readonly (number | null)[]): TWorldClimAvgBoxBinding {
  return Object.fromEntries(
    values.flatMap((value, i) =>
      value === null
        ? []
        : [
            [
              `valueMonth${String(i + 1).padStart(2, "0")}`,
              { type: "literal", value: String(value) },
            ],
          ],
    ),
  );
}

describe("computeRegionalProfile", () => {
  it("is the shared annual summary of the region's months", () => {
    const summary = summarizeMonths(
      TMAX.map((tmax, i) => ({ tavg: (tmax + (TMIN[i] ?? 0)) / 2, prec: PREC[i] ?? null })),
    );
    expect(computeRegionalProfile(avgBinding(TMAX), avgBinding(TMIN), avgBinding(PREC))).toEqual({
      meanTemp: summary?.annualAvgTemp,
      annualPrecip: summary?.totalPrec,
      aridMonths: summary?.aridCount,
      martonneIndex: summary?.martonne,
    });
  });

  it("has no profile while a month lacks a value, as on every other page", () => {
    const precWithGap = PREC.map((value, i) => (i === 6 ? null : value));
    expect(
      computeRegionalProfile(avgBinding(TMAX), avgBinding(TMIN), avgBinding(precWithGap)),
    ).toBeNull();
    expect(computeRegionalProfile(null, avgBinding(TMIN), avgBinding(PREC))).toBeNull();
  });
});

describe("region bounds", () => {
  it("reads a polygon's and a WKT polygon's (lng lat) bounds alike", () => {
    const bounds = { north: 49.5, south: 49, west: 24, east: 24.5 };
    expect(
      getPolygonBounds([
        [49, 24],
        [49, 24.5],
        [49.5, 24.25],
      ]),
    ).toEqual(bounds);
    expect(
      getWktBounds(
        "POLYGON((24.00000 49.00000, 24.50000 49.00000, 24.25000 49.50000, 24.00000 49.00000))",
      ),
    ).toEqual(bounds);
  });
});
