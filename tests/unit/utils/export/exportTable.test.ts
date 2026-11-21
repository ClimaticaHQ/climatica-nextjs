import { DIFFERENCE_DIRECTION_SEPARATOR, EXPORT_MONTHLY_VALUES, EXPORT_TABLE } from "@/constants";
import { EWalterLiethSeriesId } from "@/enums";
import messages from "@/i18n/locales/en.json";
import type {
  TComparisonTable,
  TComparisonTableLabels,
  TExportChartColors,
  TMonthlyTableRow,
} from "@/types";
import { getMartonneBadge, getPrecipitationTicks } from "@/utils";
import { buildComparisonTableSvg } from "@/utils/export/svg/comparisonTableExport.util";
import { buildExportTableSvg, getTableLabelWidth } from "@/utils/export/svg/exportTable.util";
import {
  buildMonthlyTableSvg,
  getMonthlyTableLabelWidth,
} from "@/utils/export/svg/monthlyTableExport.util";
import { getRowHeaders } from "@/utils/export/svg/monthlyValuesExport.util";
import { measureExportText, wrapUrl } from "@/utils/export/svg/textWrap.util";
import { describe, expect, it } from "vitest";

const COLORS: TExportChartColors = {
  text: "#000",
  textSecondary: "#666",
  border: "#ccc",
  bg: "#fff",
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
const BOX = { top: 92, left: 40, width: 920, colors: COLORS };
const count = (svg: string, needle: string) => svg.split(needle).length - 1;
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("buildExportTableSvg", () => {
  const columns = [
    { label: "Paris", shape: "circle" as const },
    { label: "Oslo", shape: "square" as const },
    { label: "Difference", subtitle: "Oslo – Paris", isMuted: true },
  ];
  const rows = [
    { label: "Mean temp", cells: ["11.9 °C", "6.3 °C", "−5.6 °C"] },
    { label: "Annual precip", cells: ["670 mm", "715 mm", "+45 mm"] },
  ];
  const { svg, bottom } = buildExportTableSvg({ columns, rows, ...BOX });

  it("draws a square, unfilled frame: no rounded corners, no header fill", () => {
    expect(svg).not.toContain("rx=");
    expect(count(svg, "<rect")).toBe(1);
    expect(svg).toContain(`fill="none" stroke="${COLORS.border}"`);
  });

  it("draws a plain grid: a line before each column and under each head row", () => {
    expect(count(svg, "<line")).toBe(columns.length + rows.length);
  });

  it("centres every value and puts each row's cells in its columns", () => {
    for (const cell of rows.flatMap(({ cells }) => cells)) {
      expect(svg).toMatch(new RegExp(`text-anchor="middle"[^>]*>${escapeRegExp(cell)}<`));
    }
  });

  it("draws the difference column: its direction under the head, its values muted", () => {
    expect(svg).toContain(">Oslo – Paris<");
    expect(svg).toMatch(new RegExp(`fill="${COLORS.textSecondary}">−5.6 °C<`));
    expect(svg).toMatch(new RegExp(`fill="${COLORS.text}">11.9 °C<`));
  });

  it("puts each series' shape in its head, none for the difference", () => {
    expect(count(svg, `<path d="`)).toBe(2);
  });

  it("ends below its taller, two-line head and its rows", () => {
    expect(bottom).toBe(
      BOX.top + EXPORT_TABLE.HEADER_WITH_SUBTITLE_HEIGHT + EXPORT_TABLE.ROW_HEIGHT * rows.length,
    );
  });

  it("gives the label column the width its longest label needs", () => {
    const long = "Martonne index (M), per year";
    expect(getTableLabelWidth(["Mean temp", long])).toBe(
      measureExportText(long, EXPORT_TABLE.LABEL_FONT_SIZE) + EXPORT_TABLE.PADDING_X * 2,
    );
  });
});

describe("buildComparisonTableSvg", () => {
  const table: TComparisonTable = {
    seriesA: { id: EWalterLiethSeriesId.A, label: "Paris" },
    seriesB: { id: EWalterLiethSeriesId.B, label: "Oslo" },
    minuend: "Oslo",
    subtrahend: "Paris",
    rows: [
      { metric: "meanTemp", a: { text: "11.9 °C" }, b: { text: "6.3 °C" }, difference: "−5.6 °C" },
      {
        metric: "martonne",
        a: { text: "30.5", badge: getMartonneBadge(30.5) },
        b: { text: "43.8", badge: getMartonneBadge(43.8) },
        difference: "+13.3",
      },
    ],
  };
  const labels: TComparisonTableLabels = {
    metrics: {
      meanTemp: "Mean temp",
      avgTmax: "Avg max temp",
      avgTmin: "Avg min temp",
      annualPrec: "Annual precip",
      aridMonths: "Arid months",
      frostMonths: "Frost months",
      altitude: "Altitude",
      martonne: "Martonne (M)",
    },
    difference: "Difference",
    martonneClasses: { a: messages.martonne.humid, b: messages.martonne.veryHumid },
  };
  const { svg } = buildComparisonTableSvg({ table, labels, ...BOX });

  it("writes the De Martonne class as plain text after the value, no pill", () => {
    expect(svg).toContain(">30.5 (Humid)<");
    expect(svg).toContain(">43.8 (Very humid)<");
    expect(svg).not.toContain("rx=");
  });

  it("keeps the difference column with its direction", () => {
    expect(svg).toContain(">Difference<");
    expect(svg).toContain(`>Oslo${DIFFERENCE_DIRECTION_SEPARATOR}Paris<`);
    expect(svg).toContain(">+13.3<");
  });
});

describe("export row labels", () => {
  const minGutter = 44;

  it("heads a pair of periods with their full labels", () => {
    const { labels, gutter } = getRowHeaders({
      series: [
        { label: "1961–1990", shortLabel: "’61–’90" },
        { label: "1991–2020", shortLabel: "’91–’20" },
      ],
      minGutter,
    });
    expect(labels).toEqual(["1961–1990", "1991–2020"]);
    expect(gutter).toBeGreaterThanOrEqual(
      measureExportText("1961–1990", EXPORT_MONTHLY_VALUES.VALUE_FONT_SIZE.WIDE),
    );
  });

  it("heads cities with their names while they fit", () => {
    const { labels } = getRowHeaders({
      series: [
        { label: "Paris", shortLabel: "PAR" },
        { label: "Oslo", shortLabel: "OSL" },
      ],
      minGutter,
    });
    expect(labels).toEqual(["Paris", "Oslo"]);
  });

  it("falls back to short labels, never a cut name, when a name is too long", () => {
    const { labels, gutter } = getRowHeaders({
      series: [
        { label: "Santiago de Compostela", shortLabel: "SDC" },
        { label: "Oslo", shortLabel: "OSL" },
      ],
      minGutter,
    });
    expect(labels).toEqual(["SDC", "OSL"]);
    expect(labels.join("")).not.toContain("…");
    // * the unit and the short labels beside it
    expect(gutter).toBeGreaterThanOrEqual(
      measureExportText("°C", EXPORT_MONTHLY_VALUES.UNIT_FONT_SIZE) +
        measureExportText("SDC", EXPORT_MONTHLY_VALUES.VALUE_FONT_SIZE.WIDE),
    );
    expect(gutter).toBeLessThan(EXPORT_MONTHLY_VALUES.ROW_HEADER_MAX_WIDTH);
  });

  it("widens the monthly table's label column to its longest row, never cutting it", () => {
    const row = (seriesLabel: string): TMonthlyTableRow => ({
      key: seriesLabel,
      variable: "tmax",
      variableLabel: "Max Temp",
      unit: "°C",
      seriesLabel,
      marker: { shape: "circle", color: "#555" },
      values: Array.from({ length: 12 }, () => "1.0"),
    });
    const rows = [row("Santiago de Compostela, Climate 1991–2020"), row("Oslo")];
    const { svg } = buildMonthlyTableSvg({
      rows,
      monthNames: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
      ...BOX,
    });
    expect(svg).toContain("Santiago de Compostela, Climate 1991–2020");
    expect(svg).not.toContain("…");
    expect(getMonthlyTableLabelWidth(rows)).toBeGreaterThan(
      getMonthlyTableLabelWidth([row("Oslo")]),
    );
  });
});

describe("wrapUrl", () => {
  const url =
    "https://climatica.gsic.uva.es/compare-cities?cityA=Paris&latA=48.8566&lngA=2.3522&cityB=Oslo&latB=59.9139&lngB=10.7522&layout=overlay&chart=standard";

  it("keeps a URL that fits on one line", () => {
    expect(wrapUrl({ url, maxChars: url.length })).toEqual([url]);
  });

  it("breaks only before & or ?, every line within the width, nothing lost", () => {
    const lines = wrapUrl({ url, maxChars: 60 });
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join("")).toBe(url);
    for (const line of lines.slice(1)) expect(line).toMatch(/^[?&]/);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(60);
  });

  it("never leaves a single character on a line", () => {
    for (const maxChars of [10, 23, 47, 61, 99]) {
      for (const line of wrapUrl({ url: `${url}&x`, maxChars })) {
        expect(line.length).toBeGreaterThan(1);
      }
      expect(wrapUrl({ url: `${url}?`, maxChars }).every((line) => line.length > 1)).toBe(true);
    }
  });
});

describe("getPrecipitationTicks", () => {
  it("ends the mm axis on a tick of the same even step", () => {
    expect(getPrecipitationTicks(90)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(getPrecipitationTicks(70)).toEqual([0, 20, 40, 60, 80]);
    expect(getPrecipitationTicks(60)).toEqual([0, 10, 20, 30, 40, 50, 60]);
  });

  it("covers the maximum at an even step, at most seven ticks, whatever the range", () => {
    for (let max = 10; max <= 2000; max += 10) {
      const ticks = getPrecipitationTicks(max);
      const step = (ticks[1] ?? 0) - (ticks[0] ?? 0);
      expect(ticks[0]).toBe(0);
      expect(ticks.at(-1)).toBeGreaterThanOrEqual(max);
      expect(ticks.length).toBeLessThanOrEqual(7);
      ticks.forEach((tick, i) => expect(tick).toBe(i * step));
    }
  });
});

describe("De Martonne class labels", () => {
  it("reads 'Very humid' in English, not a hyphenated key", () => {
    expect(messages.martonne.veryHumid).toBe("Very humid");
  });
});
