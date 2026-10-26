import { toOverlayLayer } from "@/components/charts/charts.util";
import { WALTER_LIETH_CONVENTION_COLORS, WALTER_LIETH_DASH } from "@/constants";
import { getPairShape } from "@/utils/seriesShape.util";
import { EWalterLiethSeriesId, EWalterLiethShading } from "@/enums";
import type { TWalterLiethSeries } from "@/types";
import {
  buildWalterLiethRows,
  getAridHumidSegments,
  isShadedSeries,
  orderShadedFirst,
} from "@/utils/walterLieth.util";
import { describe, expect, it } from "vitest";

const months = Array.from({ length: 12 }, (_, i) => ({ tavg: 10 + i, prec: 40 }));
const series = (id: EWalterLiethSeriesId): TWalterLiethSeries => ({
  id,
  label: id,
  period: "1970–2000",
  months,
});
const layerOf = (id: EWalterLiethSeriesId, isShaded: boolean) =>
  toOverlayLayer({
    key: id,
    rows: buildWalterLiethRows(months),
    segments: getAridHumidSegments({ months }),
    patternIds: { humid: `${id}-h`, arid: `${id}-a` },
    isShaded,
    shape: getPairShape(id),
  });

describe("toOverlayLayer", () => {
  it("paints in the diagram's semantic colours, never the series', and dashes precipitation", () => {
    const layer = layerOf(EWalterLiethSeriesId.B, true);
    expect(layer.colors).toMatchObject({
      temp: WALTER_LIETH_CONVENTION_COLORS.temp,
      prec: WALTER_LIETH_CONVENTION_COLORS.prec,
      humidHatch: WALTER_LIETH_CONVENTION_COLORS.humidHatch,
      aridHatch: WALTER_LIETH_CONVENTION_COLORS.aridHatch,
    });
    expect(layerOf(EWalterLiethSeriesId.A, true).colors).toEqual(layer.colors);
    expect(layer.precDash).toBe(WALTER_LIETH_DASH.OVERLAY_PREC);
  });

  it("reuses the same segments when shaded and drops them when not — no new geometry", () => {
    expect(layerOf(EWalterLiethSeriesId.A, true).segments).toEqual(
      getAridHumidSegments({ months }),
    );
    expect(layerOf(EWalterLiethSeriesId.A, false).segments).toEqual([]);
  });

  it("tells the two series apart by their dots' shape alone", () => {
    expect(layerOf(EWalterLiethSeriesId.A, false).dotShape).not.toBe(
      layerOf(EWalterLiethSeriesId.B, false).dotShape,
    );
  });
});

describe("isShadedSeries / orderShadedFirst", () => {
  it("maps each shading option to its series, and none to neither", () => {
    const a = series(EWalterLiethSeriesId.A);
    const b = series(EWalterLiethSeriesId.B);

    expect([
      isShadedSeries(a.id, EWalterLiethShading.A),
      isShadedSeries(b.id, EWalterLiethShading.A),
    ]).toEqual([true, false]);
    expect([
      isShadedSeries(a.id, EWalterLiethShading.B),
      isShadedSeries(b.id, EWalterLiethShading.B),
    ]).toEqual([false, true]);
    expect([
      isShadedSeries(a.id, EWalterLiethShading.NONE),
      isShadedSeries(b.id, EWalterLiethShading.NONE),
    ]).toEqual([false, false]);
  });

  it("draws the shaded series first, so its fill never covers the other series' curves", () => {
    const ordered = orderShadedFirst([
      { key: EWalterLiethSeriesId.A, isShaded: false },
      { key: EWalterLiethSeriesId.B, isShaded: true },
    ]);
    expect(ordered.map((layer) => layer.key)).toEqual([
      EWalterLiethSeriesId.B,
      EWalterLiethSeriesId.A,
    ]);
  });
});
