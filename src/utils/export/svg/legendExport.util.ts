import { CHART_LEGEND, EXPORT_LEGEND, WALTER_LIETH_FROST } from "@/constants";
import { ELegendSwatch } from "@/enums";
import type {
  TExportChartColors,
  TExportLegendArgs,
  TExportLegendResult,
  TExportSwatch,
  TExportSwatchArgs,
  TLegendItem,
  TWalterLiethLegendPalette,
} from "@/types";
import { getHatchGeometry, getLegendSwatchWidth, getMarkerPath, getSwatchSize } from "@/utils";
import { buildHatchPattern } from "./hatchExport.util";
import { escapeXml } from "./buildExportSvg.util";
import { measureExportText } from "./textWrap.util";
import { buildWalterLiethPatterns } from "./walterLiethExport.util";

const R = CHART_LEGEND.SWATCH_RADIUS;
const FROST_INSET = WALTER_LIETH_FROST.STROKE_WIDTH / 2;

/** The WL legend's palette resolved to export colors — the screen uses the same CSS vars. */
export const getWalterLiethExportPalette = (
  colors: TExportChartColors,
): TWalterLiethLegendPalette => ({
  temp: colors.wlTemp,
  prec: colors.wlPrec,
  humidHatch: colors.wlHumidHatch,
  aridHatch: colors.wlAridHatch,
  perhumid: colors.wlCompressedFill,
  frost: colors.wlFrost,
  frostOutline: colors.wlFrostOutline,
});

/** String twin of the ChartLegend swatches — the same descriptors, drawn as SVG markup. */
export function buildSwatch({ swatch, x, top, size, id }: TExportSwatchArgs): TExportSwatch {
  const { width: w, height: h } = size;
  const box = (width: number, color: string) =>
    `<rect x="${(x + (w - width) / 2).toFixed(2)}" y="${top}" width="${width.toFixed(2)}" height="${h}" rx="${R}" fill="${color}" />`;
  // * a switch narrows the descriptor union without casts
  switch (swatch.kind) {
    case ELegendSwatch.LINE: {
      const dash = swatch.dash !== undefined ? ` stroke-dasharray="${swatch.dash}"` : "";
      return {
        svg: `<line x1="${x}" y1="${top + h / 2}" x2="${x + w}" y2="${top + h / 2}" stroke="${swatch.color}" stroke-width="${CHART_LEGEND.LINE_WIDTH}"${dash} />`,
        defs: "",
      };
    }
    case ELegendSwatch.BAR:
      return { svg: box(w * CHART_LEGEND.BAR_WIDTH_RATIO, swatch.color), defs: "" };
    case ELegendSwatch.PERHUMID:
      return { svg: box(w, swatch.color), defs: "" };
    case ELegendSwatch.FROST:
      return {
        // * inset by half the stroke, like FrostSwatch.tsx, so the outline stays in the box
        svg: `<rect x="${x + FROST_INSET}" y="${top + FROST_INSET}" width="${w - WALTER_LIETH_FROST.STROKE_WIDTH}" height="${h - WALTER_LIETH_FROST.STROKE_WIDTH}" fill="${swatch.color}" stroke="${swatch.outline}" stroke-width="${WALTER_LIETH_FROST.STROKE_WIDTH}" />`,
        defs: "",
      };
    case ELegendSwatch.MARKER: {
      const size = h * CHART_LEGEND.MARKER_RADIUS_RATIO * 2;
      const d = getMarkerPath({ shape: swatch.shape, cx: x + w / 2, cy: top + h / 2, size });
      return { svg: `<path d="${d}" fill="${swatch.color}" />`, defs: "" };
    }
    case ELegendSwatch.ENTITY: {
      // * the hatch square (its own pattern), then the shape square
      const patternId = `${id}-hatch`;
      const square = `x="${x}" y="${top}" width="${h}" height="${h}" rx="${R}"`;
      const hatch = swatch.hatch === "solid" ? "" : `<rect ${square} fill="url(#${patternId})" />`;
      const d = getMarkerPath({
        shape: swatch.shape,
        cx: x + h + CHART_LEGEND.ENTITY_GAP + h / 2,
        cy: top + h / 2,
        size: h * CHART_LEGEND.MARKER_RADIUS_RATIO * 2,
      });
      return {
        svg: `<rect ${square} fill="${swatch.fill}" />${hatch}<path d="${d}" fill="${swatch.color}" />`,
        defs: buildHatchPattern(patternId, swatch.hatch, swatch.hatchColor),
      };
    }
    case ELegendSwatch.HUMID:
    case ELegendSwatch.ARID: {
      const ids = { humid: `${id}-humid`, arid: `${id}-arid` };
      const paint = { humidHatch: swatch.color, aridHatch: swatch.color };
      const fill = swatch.kind === ELegendSwatch.HUMID ? ids.humid : ids.arid;
      return {
        svg: `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="${R}" fill="url(#${fill})" />`,
        defs: buildWalterLiethPatterns(ids, paint, getHatchGeometry(w), x),
      };
    }
  }
}

/**
 * Export twin of ChartLegend: the same items in rows that wrap before `width` and are
 * centered in it, like the screen legend. Returns the last row's baseline.
 */
export function buildExportLegend({
  items,
  y,
  left,
  width,
  textColor,
  idPrefix,
  measureText = measureExportText,
}: TExportLegendArgs): TExportLegendResult {
  const fontSize = CHART_LEGEND.FONT_SIZE;
  const size = getSwatchSize(fontSize);
  const swatchWidth = (item: TLegendItem) => getLegendSwatchWidth(item.swatch, size);
  const textOffset = (item: TLegendItem) => swatchWidth(item) + EXPORT_LEGEND.SWATCH_TEXT_GAP;
  const itemWidth = (item: TLegendItem) => textOffset(item) + measureText(item.label, fontSize);

  const rows = items.reduce<TLegendItem[][]>(
    (acc, item) => {
      const row = acc.at(-1);
      const rowWidth = row
        ? row.reduce((sum, known) => sum + itemWidth(known) + EXPORT_LEGEND.ITEM_GAP, 0)
        : 0;
      if (row && (row.length === 0 || rowWidth + itemWidth(item) <= width)) row.push(item);
      else acc.push([item]);
      return acc;
    },
    [[]],
  );

  let defs = "";
  const svg = rows
    .map((row, rowIndex) => {
      const rowY = y + rowIndex * EXPORT_LEGEND.ROW_HEIGHT;
      const rowWidth =
        row.reduce((sum, item) => sum + itemWidth(item), 0) +
        EXPORT_LEGEND.ITEM_GAP * (row.length - 1);
      let x = left + (width - rowWidth) / 2;
      return row
        .map((item) => {
          const { key, label, swatch, isMuted } = item;
          const top = rowY - size.height + EXPORT_LEGEND.SWATCH_BASELINE_DROP;
          const drawn = buildSwatch({
            swatch,
            x,
            top,
            size: { ...size, width: swatchWidth(item) },
            id: `${idPrefix}-${rowIndex}-${key}`,
          });
          defs += drawn.defs;
          const opacity = isMuted ? ` opacity="${CHART_LEGEND.MUTED_OPACITY}"` : "";
          const markup = `<g${opacity}>${drawn.svg}<text x="${(x + textOffset(item)).toFixed(2)}" y="${rowY}" font-size="${fontSize}" fill="${textColor}">${escapeXml(label)}</text></g>`;
          x += itemWidth(item) + EXPORT_LEGEND.ITEM_GAP;
          return markup;
        })
        .join("");
    })
    .join("");

  return {
    svg: `${defs ? `<defs>${defs}</defs>` : ""}${svg}`,
    bottom: y + (rows.length - 1) * EXPORT_LEGEND.ROW_HEIGHT,
  };
}
