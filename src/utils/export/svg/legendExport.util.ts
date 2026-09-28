import { CHART_LEGEND, EXPORT_LEGEND } from "@/constants";
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
import { getHatchGeometry, getSwatchSize } from "@/utils";
import { escapeXml } from "./buildExportSvg.util";
import { measureExportText } from "./textWrap.util";
import { buildWalterLiethPatterns } from "./walterLiethExport.util";

const R = CHART_LEGEND.SWATCH_RADIUS;

/** The WL legend's palette resolved to export colors — the screen uses the same CSS vars. */
export const getWalterLiethExportPalette = (
  colors: TExportChartColors,
): TWalterLiethLegendPalette => ({
  temp: colors.wlTemp,
  prec: colors.wlPrec,
  humidHatch: colors.wlHumidHatch,
  aridHatch: colors.wlAridHatch,
  perhumid: colors.wlCompressedFill,
});

/** String twin of the ChartLegend swatches — the same descriptors, drawn as SVG markup. */
function buildSwatch({ swatch, x, top, size, id }: TExportSwatchArgs): TExportSwatch {
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
    case ELegendSwatch.MARKER: {
      const r = h * CHART_LEGEND.MARKER_RADIUS_RATIO;
      const [cx, cy] = [x + w / 2, top + h / 2];
      return {
        svg:
          swatch.shape === "circle"
            ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${swatch.color}" />`
            : `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${swatch.color}" />`,
        defs: "",
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
    case ELegendSwatch.PAIR: {
      const half = { width: (w - CHART_LEGEND.PAIR_GAP) / 2, height: h };
      const a = buildSwatch({ swatch: swatch.a, x, top, size: half, id: `${id}-a` });
      const b = buildSwatch({
        swatch: swatch.b,
        x: x + half.width + CHART_LEGEND.PAIR_GAP,
        top,
        size: half,
        id: `${id}-b`,
      });
      return { svg: a.svg + b.svg, defs: a.defs + b.defs };
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
  const textOffset = size.width + EXPORT_LEGEND.SWATCH_TEXT_GAP;
  const itemWidth = (label: string) => textOffset + measureText(label, fontSize);

  // * first pass: split the items into rows that fit the width
  const rows = items.reduce<TLegendItem[][]>(
    (acc, item) => {
      const row = acc.at(-1);
      const rowWidth = row
        ? row.reduce((sum, { label }) => sum + itemWidth(label) + EXPORT_LEGEND.ITEM_GAP, 0)
        : 0;
      if (row && (row.length === 0 || rowWidth + itemWidth(item.label) <= width)) row.push(item);
      else acc.push([item]);
      return acc;
    },
    [[]],
  );

  // * second pass: draw each row centered
  let defs = "";
  const svg = rows
    .map((row, rowIndex) => {
      const rowY = y + rowIndex * EXPORT_LEGEND.ROW_HEIGHT;
      const rowWidth =
        row.reduce((sum, { label }) => sum + itemWidth(label), 0) +
        EXPORT_LEGEND.ITEM_GAP * (row.length - 1);
      let x = left + (width - rowWidth) / 2;
      return row
        .map(({ key, label, swatch, isMuted }) => {
          const top = rowY - size.height + EXPORT_LEGEND.SWATCH_BASELINE_DROP;
          const drawn = buildSwatch({ swatch, x, top, size, id: `${idPrefix}-${rowIndex}-${key}` });
          defs += drawn.defs;
          const opacity = isMuted ? ` opacity="${CHART_LEGEND.MUTED_OPACITY}"` : "";
          const item = `<g${opacity}>${drawn.svg}<text x="${(x + textOffset).toFixed(2)}" y="${rowY}" font-size="${fontSize}" fill="${textColor}">${escapeXml(label)}</text></g>`;
          x += itemWidth(label) + EXPORT_LEGEND.ITEM_GAP;
          return item;
        })
        .join("");
    })
    .join("");

  return {
    svg: `${defs ? `<defs>${defs}</defs>` : ""}${svg}`,
    bottom: y + (rows.length - 1) * EXPORT_LEGEND.ROW_HEIGHT,
  };
}
