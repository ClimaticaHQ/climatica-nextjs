import {
  EXPORT_PNG_SCALE,
  HEATMAP_EXPORT_SVG_LAYOUT as L,
  HEATMAP_EXPORT_TILE_LIMITS,
  SLIPPY_MAP_TILE_CONFIG,
} from "@/constants";
import type {
  TExportChartColors,
  THeatmapExportMapSection,
  TPixelPoint,
  TTileRange,
} from "@/types";
import {
  computeFitZoom,
  computeMapOrigin,
  computeTileRangeFromPixelBounds,
  projectToMapPixel,
  resolveTileZoom,
} from "@/utils/mapProjection.util";
import { escapeXml } from "./buildExportSvg.util";
import { fetchTileGrid } from "./mapTiles.util";

const MAP_CLIP_ID = "heatmap-export-map-clip";
// RASTER_SELECTION_PATH_OPTIONS (map.constant.ts) — the live map's bbox/polygon
// outline style, replicated here since colors must be literal in the export.
const SELECTION_FILL_OPACITY = 0.2;
const SELECTION_STROKE_WIDTH = 2;
// HeatmapLayer.tsx's L.rectangle fillOpacity for each cell.
const CELL_FILL_OPACITY = 0.55;

function buildAttribution(
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
  colors: TExportChartColors,
): string {
  const text = "© OpenStreetMap contributors";
  const fontSize = 10;
  const paddingX = 6;
  const paddingY = 4;
  // Same avg-char-width heuristic the footer's own URL-fitting math uses.
  const boxWidth = text.length * fontSize * 0.55 + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;
  const boxX = rectX + rectWidth - boxWidth;
  const boxY = rectY + rectHeight - boxHeight;

  return `
    <rect x="${boxX.toFixed(2)}" y="${boxY.toFixed(2)}" width="${boxWidth.toFixed(2)}" height="${boxHeight}" fill="${colors.bg}" fill-opacity="0.75" />
    <text x="${(boxX + boxWidth - paddingX).toFixed(2)}" y="${(boxY + boxHeight - paddingY).toFixed(2)}" text-anchor="end" font-size="${fontSize}" fill="${colors.textSecondary}">${escapeXml(text)}</text>
  `;
}

function buildTiles(
  tiles: Map<string, string | null>,
  range: TTileRange,
  zoomDelta: number,
  tileDrawSizePx: number,
  origin: TPixelPoint,
  rectX: number,
  rectY: number,
  colors: TExportChartColors,
): string {
  const scale = 2 ** zoomDelta;
  const nativeTileSizePx = SLIPPY_MAP_TILE_CONFIG.tileSizePx;
  const parts: string[] = [];

  for (let x = range.minX; x <= range.maxX; x++) {
    for (let y = range.minY; y <= range.maxY; y++) {
      const drawX = rectX + (x * nativeTileSizePx) / scale - origin.x;
      const drawY = rectY + (y * nativeTileSizePx) / scale - origin.y;
      const dataUrl = tiles.get(`${x},${y}`);

      parts.push(
        dataUrl
          ? `<image href="${dataUrl}" x="${drawX.toFixed(2)}" y="${drawY.toFixed(2)}" width="${tileDrawSizePx}" height="${tileDrawSizePx}" />`
          : `<rect x="${drawX.toFixed(2)}" y="${drawY.toFixed(2)}" width="${tileDrawSizePx}" height="${tileDrawSizePx}" fill="${colors.border}" />`,
      );
    }
  }

  return parts.join("");
}

/** Axis-aligned — a lat/lng bounding rect stays axis-aligned in Web Mercator
 * pixel space, since x depends only on lng and y only on lat. */
function buildCells(
  section: THeatmapExportMapSection,
  zoom: number,
  origin: TPixelPoint,
  rectX: number,
  rectY: number,
): string {
  return section.cells
    .map((cell) => {
      const topLeft = projectToMapPixel(cell.bounds.north, cell.bounds.west, zoom, origin);
      const bottomRight = projectToMapPixel(cell.bounds.south, cell.bounds.east, zoom, origin);
      const x = rectX + topLeft.x;
      const y = rectY + topLeft.y;
      const width = bottomRight.x - topLeft.x;
      const height = bottomRight.y - topLeft.y;
      return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" fill="${cell.color}" fill-opacity="${CELL_FILL_OPACITY}" />`;
    })
    .join("");
}

function buildSelection(
  section: THeatmapExportMapSection,
  zoom: number,
  origin: TPixelPoint,
  rectX: number,
  rectY: number,
  colors: TExportChartColors,
): string {
  const { selection } = section;
  const shared = `fill="${colors.primary}" fill-opacity="${SELECTION_FILL_OPACITY}" stroke="${colors.primary}" stroke-width="${SELECTION_STROKE_WIDTH}"`;

  if (selection.kind === "bbox") {
    const topLeft = projectToMapPixel(selection.bounds.north, selection.bounds.west, zoom, origin);
    const bottomRight = projectToMapPixel(
      selection.bounds.south,
      selection.bounds.east,
      zoom,
      origin,
    );
    const x = rectX + topLeft.x;
    const y = rectY + topLeft.y;
    const width = bottomRight.x - topLeft.x;
    const height = bottomRight.y - topLeft.y;
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" ${shared} />`;
  }

  const points = selection.vertices
    .map(([lat, lng]) => {
      const p = projectToMapPixel(lat, lng, zoom, origin);
      return `${(rectX + p.x).toFixed(2)},${(rectY + p.y).toFixed(2)}`;
    })
    .join(" ");
  return `<polygon points="${points}" ${shared} />`;
}

/**
 * Draws the heat-map export's map section: basemap tiles (fetched live and
 * inlined as data URIs — external hrefs don't survive rasterization), the
 * heatmap cells and the selection outline, all projected through the exact
 * same fittedZoom/origin so nothing drifts between layers, clipped to the
 * section rect, plus the OSM attribution required by the ODbL.
 */
export async function buildHeatmapMapSection(
  section: THeatmapExportMapSection,
  colors: TExportChartColors,
): Promise<string> {
  const rectX = L.paddingX;
  const rectY = L.mapY;
  const rectWidth = L.mapWidth;
  const rectHeight = L.mapHeight;

  const { selectionBounds } = section;
  const fittedZoom = computeFitZoom(selectionBounds, rectWidth, rectHeight, L.mapPaddingRatio);
  const centerLat = (selectionBounds.north + selectionBounds.south) / 2;
  const centerLng = (selectionBounds.west + selectionBounds.east) / 2;
  const origin = computeMapOrigin(centerLat, centerLng, fittedZoom, rectWidth, rectHeight);

  let { tileZoom, zoomDelta, tileDrawSizePx } = resolveTileZoom(fittedZoom, EXPORT_PNG_SCALE);
  let scale = 2 ** zoomDelta;
  let range = computeTileRangeFromPixelBounds(
    { x: origin.x * scale, y: origin.y * scale },
    { x: (origin.x + rectWidth) * scale, y: (origin.y + rectHeight) * scale },
    tileZoom,
  );

  const tileCount = (range.maxX - range.minX + 1) * (range.maxY - range.minY + 1);
  if (tileCount > HEATMAP_EXPORT_TILE_LIMITS.maxTileCount) {
    tileZoom = fittedZoom;
    zoomDelta = 0;
    tileDrawSizePx = SLIPPY_MAP_TILE_CONFIG.tileSizePx;
    scale = 1;
    range = computeTileRangeFromPixelBounds(
      origin,
      { x: origin.x + rectWidth, y: origin.y + rectHeight },
      tileZoom,
    );
  }

  const tiles = await fetchTileGrid(range.minX, range.maxX, range.minY, range.maxY, tileZoom);

  const body = [
    `<defs><clipPath id="${MAP_CLIP_ID}"><rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" /></clipPath></defs>`,
    `<g clip-path="url(#${MAP_CLIP_ID})">`,
    buildTiles(tiles, range, zoomDelta, tileDrawSizePx, origin, rectX, rectY, colors),
    buildCells(section, fittedZoom, origin, rectX, rectY),
    buildSelection(section, fittedZoom, origin, rectX, rectY, colors),
    `</g>`,
    `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="none" stroke="${colors.border}" stroke-width="1" />`,
    buildAttribution(rectX, rectY, rectWidth, rectHeight, colors),
  ].join("\n");

  return body;
}
