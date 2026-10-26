import { EWalterLiethSeriesId } from "@/enums";
import type {
  TExportChartColors,
  TSeriesShape,
  TWalterLiethSeriesInput,
  TWalterLiethYearsExport,
} from "@/types";
import { buildWalterLiethYearsBody } from "@/utils/export/svg/buildCompareWalterLiethSvg.util";
import { describe, expect, it } from "vitest";

const COLORS: TExportChartColors = {
  text: "#000",
  textSecondary: "#666",
  border: "#ccc",
  bg: "#fff",
  bgSecondary: "#f5f5f5",
  tmax: "#f00",
  tmin: "#00f",
  tavg: "#f80",
  arid: "#fc0",
  humid: "#9cf",
  brand: "#22a274",
  wlTemp: "#dc2626",
  wlPrec: "#2563eb",
  wlHumidHatch: "#2563eb",
  wlAridHatch: "#dc2626",
  wlCompressedFill: "#1d4ed8",
  wlFrost: "#4682b4",
  wlFrostOutline: "#6b7280",
  seriesMarker: "#555555",
};

const months = (shift: number) =>
  Array.from({ length: 12 }, (_, i) => ({ tavg: 15 + shift + i, prec: 20 + i * 15 }));

const year = (label: string, shape: TSeriesShape, isComplete = true): TWalterLiethSeriesInput => ({
  id: EWalterLiethSeriesId.A,
  label,
  period: "Weather · single year",
  singleYear: Number(label),
  shape,
  months: isComplete ? months(Number(label) % 3) : null,
});

const yearsExport = (series: readonly TWalterLiethSeriesInput[]): TWalterLiethYearsExport => ({
  series,
  monthLabels: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
  labels: {
    locale: "en",
    temp: "Avg temperature",
    prec: "Precipitation",
    humid: "Humid",
    arid: "Arid",
    perhumid: "Very humid",
    frost: "Frost",
    incomplete: Object.fromEntries(series.map(({ label }) => [label, `${label}: incomplete`])),
  },
});

describe("buildWalterLiethYearsBody", () => {
  const years = [year("2021", "circle"), year("1967", "square"), year("1990", "triangle", false)];
  const { body, bottom } = buildWalterLiethYearsBody(yearsExport(years), COLORS, 100);

  it("draws one card per year, named by the year and its shape, in graphite", () => {
    for (const label of ["2021", "1967", "1990"]) expect(body).toContain(`>${label}</text>`);
    // * each card's header marker: the year's shape in the markers' graphite
    expect(
      body.match(new RegExp(`<path d="[^"]+" fill="${COLORS.seriesMarker}" />`, "g"))?.length,
    ).toBe(3);
    expect(body.match(/Weather · single year/g)?.length).toBe(3);
  });

  it("shows the notice for a year with missing months, and one legend", () => {
    expect(body).toContain("1990: incomplete");
    expect(body.match(/>Avg temperature</g)?.length).toBe(1);
  });

  it("gives every year its own pattern and clip ids", () => {
    const ids = [...body.matchAll(/id="([^"]+)"/g)].map(([, id]) => id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.some((id) => id.startsWith("wl-year-2021"))).toBe(true);
    expect(ids.some((id) => id.startsWith("wl-year-1967"))).toBe(true);
  });

  it("lays out two cards a row — a third year starts a row below", () => {
    const twoYears = buildWalterLiethYearsBody(yearsExport(years.slice(0, 2)), COLORS, 100);
    expect(bottom).toBeGreaterThan(twoYears.bottom);
  });
});
