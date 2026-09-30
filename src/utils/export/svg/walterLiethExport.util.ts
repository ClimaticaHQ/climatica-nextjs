import {
  WALTER_LIETH_EXPORT_TEXT,
  EXPORT_TEXT,
  WALTER_LIETH_AXIS,
  WALTER_LIETH_DASH,
  WALTER_LIETH_DIAGRAM,
  WALTER_LIETH_DOT,
  EXPORT_AXES_STYLE,
  WALTER_LIETH_HATCH,
  WALTER_LIETH_STROKE,
  WALTER_LIETH_FROST,
} from "@/constants";
import { EWalterLiethRegime, type EWalterLiethFrost } from "@/enums";
import type {
  TExportChartColors,
  TWalterLiethExportLayer,
  TWalterLiethExportPanelArgs,
  TWalterLiethExportPatternIds,
  TWalterLiethHatchGeometry,
  TWalterLiethLayerPaint,
  TWalterLiethProjection,
  TWalterLiethSegment,
  TExportFrostBandArgs,
  TWalterLiethFrostRect,
  TExportNoticeArgs,
} from "@/types";
import {
  buildWalterLiethRows,
  escapeXml,
  getAridHumidSegments,
  getFrostBand,
  getHatchGeometry,
  getRegimeFill,
  getWalterLiethPrecTicks,
  getWalterLiethTempTicks,
  partitionSegmentsByLayer,
  toPrecipAxisValue,
  toSvgPath,
} from "@/utils";
import { buildGridAndAxes } from "./buildExportSvg.util";
import { createLinearScale } from "./scales.util";
import { wrapWords } from "./textWrap.util";

/** Export twin of WalterLiethIncompleteNotice.tsx: wrapped, centered in the given box. */
export function buildNotice({ text, box, colors }: TExportNoticeArgs): string {
  const fontSize = EXPORT_TEXT.NOTICE_FONT_SIZE;
  const lineHeight = fontSize * EXPORT_TEXT.LINE_HEIGHT_RATIO;
  const lines = wrapWords(text, box.right - box.left, fontSize);
  const centerX = (box.left + box.right) / 2;
  const firstY = (box.top + box.bottom) / 2 - ((lines.length - 1) * lineHeight) / 2;

  return lines
    .map(
      (line, i) =>
        `<text x="${centerX}" y="${(firstY + i * lineHeight).toFixed(1)}" text-anchor="middle" font-size="${fontSize}" fill="${colors.textSecondary}">${escapeXml(line)}</text>`,
    )
    .join("");
}

/** The single diagram's paint (WL convention), resolved to export colors. */
export function getConventionExportPaint(colors: TExportChartColors): TWalterLiethLayerPaint {
  return {
    temp: colors.wlTemp,
    prec: colors.wlPrec,
    humidHatch: colors.wlHumidHatch,
    aridHatch: colors.wlAridHatch,
    perhumid: colors.wlCompressedFill,
    perhumidOpacity: 1,
  };
}

/**
 * String twin of WalterLiethPatterns.tsx — the same getHatchGeometry output, so screen and
 * PNG hatch identically. originX starts the tiles at the plot's left edge.
 */
export function buildWalterLiethPatterns(
  { humid, arid }: TWalterLiethExportPatternIds,
  paint: Pick<TWalterLiethLayerPaint, "humidHatch" | "aridHatch">,
  geometry: TWalterLiethHatchGeometry,
  originX: number,
): string {
  const { spacing, dotRadius, dotRowHeight } = geometry;
  const column = spacing / 2;
  return `
    <pattern id="${humid}" x="${originX}" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <line x1="${column}" y1="0" x2="${column}" y2="${spacing}" stroke="${paint.humidHatch}" stroke-width="${WALTER_LIETH_HATCH.HUMID_STROKE_WIDTH}" />
    </pattern>
    <pattern id="${arid}" x="${originX}" width="${spacing}" height="${dotRowHeight}" patternUnits="userSpaceOnUse">
      <circle cx="${column}" cy="${dotRowHeight / 2}" r="${dotRadius}" fill="${paint.aridHatch}" />
    </pattern>`;
}

/** String twin of WalterLiethDot.tsx — circle for series A, square for series B. */
function buildDot(
  x: number,
  y: number,
  shape: TWalterLiethExportLayer["dotShape"],
  color: string,
  bg: string,
) {
  const r = WALTER_LIETH_DOT.RADIUS;
  const common = `fill="${color}" stroke="${bg}" stroke-width="${WALTER_LIETH_DOT.STROKE_WIDTH}"`;
  return shape === "square"
    ? `<rect x="${(x - r).toFixed(2)}" y="${(y - r).toFixed(2)}" width="${r * 2}" height="${r * 2}" ${common} />`
    : `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r}" ${common} />`;
}

/** String twin of WalterLiethHalo.tsx: the background-colored band under a curve. */
function buildHalo(d: string, width: number, bg: string) {
  return `<path d="${d}" fill="none" stroke="${bg}" stroke-width="${width + WALTER_LIETH_STROKE.HALO_EXTRA_WIDTH}" stroke-linejoin="round" />`;
}

/** String twin of WalterLiethCurve.tsx: a curve's stroke. */
function buildCurve(d: string, color: string, width: number, dash?: string) {
  const dashAttr = dash !== undefined ? ` stroke-dasharray="${dash}"` : "";
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"${dashAttr} />`;
}

/** Segment polygons in their regime fill — the string twin of WalterLiethSegmentPaths.tsx. */
function buildSegmentPaths(
  segments: readonly TWalterLiethSegment[],
  { patternIds, paint }: Pick<TWalterLiethExportLayer, "patternIds" | "paint">,
  projection: TWalterLiethProjection,
) {
  return segments
    .map((segment) => {
      const fill = getRegimeFill({
        regime: segment.regime,
        humidPatternUrl: `url(#${patternIds.humid})`,
        aridPatternUrl: `url(#${patternIds.arid})`,
        perhumidColor: paint.perhumid,
      });
      const opacity = segment.regime === EWalterLiethRegime.PERHUMID ? paint.perhumidOpacity : 1;
      return `<path d="${toSvgPath({ points: segment.points, ...projection })}" fill="${fill}" fill-opacity="${opacity}" stroke="none" />`;
    })
    .join("");
}

/**
 * One layer, painted like WalterLiethSeriesLayer.tsx: hatching → curve halos → perhumid fill
 * → curves → temperature markers. Unshaded (overlay) layers get no segments.
 */
function buildLayer(
  layer: TWalterLiethExportLayer,
  projection: TWalterLiethProjection,
  bg: string,
): string {
  const { months, paint, isShaded, dotShape, precDash } = layer;
  const { scaleX, scaleY } = projection;
  const rows = buildWalterLiethRows(months);
  const { hatched, perhumid } = partitionSegmentsByLayer(
    isShaded ? getAridHumidSegments({ months }) : [],
  );
  const curve = (key: "tavg" | "precAxis") =>
    toSvgPath({
      points: rows.map((row) => ({ x: row.position, y: row[key] })),
      scaleX,
      scaleY,
      isClosed: false,
    });
  const prec = curve("precAxis");
  const temp = curve("tavg");
  const dots = rows
    .map((row) => buildDot(scaleX(row.position), scaleY(row.tavg), dotShape, paint.temp, bg))
    .join("");

  return [
    buildSegmentPaths(hatched, layer, projection),
    buildHalo(prec, WALTER_LIETH_STROKE.PREC_WIDTH, bg),
    buildHalo(temp, WALTER_LIETH_STROKE.TEMP_WIDTH, bg),
    buildSegmentPaths(perhumid, layer, projection),
    buildCurve(prec, paint.prec, WALTER_LIETH_STROKE.PREC_WIDTH, precDash),
    buildCurve(temp, paint.temp, WALTER_LIETH_STROKE.TEMP_WIDTH),
    dots,
  ].join("");
}

/**
 * String twin of WalterLiethFrostBand.tsx: the same getFrostBand cells, boundary dividers /
 * ticks and frame. Exports always draw the full-height band (their month labels sit below it).
 */
function buildFrostBand(
  frost: readonly EWalterLiethFrost[],
  { colors, scaleX, axisY }: TExportFrostBandArgs,
) {
  const { cells, boundaries, frame } = getFrostBand({
    frost,
    palette: { frost: colors.wlFrost, outline: colors.wlFrostOutline, unknown: colors.border },
    scaleX,
    axisY,
    isCompact: false,
  });
  const stroke = `stroke="${colors.wlFrostOutline}" stroke-width="${WALTER_LIETH_FROST.STROKE_WIDTH}"`;
  const rect = ({ x, y, width, height }: TWalterLiethFrostRect) =>
    `x="${x.toFixed(2)}" y="${y}" width="${width.toFixed(2)}" height="${height}"`;
  return [
    ...cells.map((cell) => `<rect ${rect(cell)} fill="${cell.fill}" stroke="none" />`),
    ...boundaries.map(
      ({ x, y1, y2 }) =>
        `<line x1="${x.toFixed(2)}" y1="${y1}" x2="${x.toFixed(2)}" y2="${y2}" ${stroke} />`,
    ),
    `<rect ${rect(frame)} fill="none" ${stroke} />`,
  ].join("");
}

/**
 * One WL plot area — grid and axes (shared WL tick rules), the dashed top-of-scale line,
 * then every layer: the same getAridHumidSegments polygons, patterns and halo curves the
 * live diagram draws, with month i at the centre of its band (x domain [-0.5, 11.5]).
 */
export function buildWalterLiethPanel({
  layers,
  domain,
  colors,
  box,
  clipId,
  monthLabels,
  frost,
}: TWalterLiethExportPanelArgs): string {
  const edge = WALTER_LIETH_DIAGRAM.MONTH_EDGE_PADDING;
  const monthCount = WALTER_LIETH_DIAGRAM.MONTHS_PER_YEAR;
  const scaleX = createLinearScale(-edge, monthCount - 1 + edge, box.left, box.right);
  const scaleY = createLinearScale(domain.tempMin, domain.plotMax, box.bottom, box.top);

  const axes = buildGridAndAxes(
    domain,
    colors,
    scaleY,
    scaleY,
    box.left,
    box.right,
    box.top,
    box.bottom,
    getWalterLiethPrecTicks(domain),
    toPrecipAxisValue,
    getWalterLiethTempTicks(domain),
    EXPORT_AXES_STYLE,
  );
  const ceilingY = scaleY(domain.tempMax);
  const ceiling =
    domain.plotMax > domain.tempMax
      ? `<line x1="${box.left}" y1="${ceilingY}" x2="${box.right}" y2="${ceilingY}" stroke="${colors.textSecondary}" stroke-opacity="${WALTER_LIETH_AXIS.REFERENCE_LINE_OPACITY}" stroke-dasharray="${WALTER_LIETH_DASH.TEMP_MAX_REFERENCE}" />`
      : "";
  // * hatching follows the month width — same rule as the live diagram
  const geometry = getHatchGeometry(scaleX(1) - scaleX(0));
  const patterns = layers
    .map((layer) => buildWalterLiethPatterns(layer.patternIds, layer.paint, geometry, box.left))
    .join("");
  const labels = (monthLabels ?? [])
    .map(
      (label, i) =>
        `<text x="${scaleX(i).toFixed(2)}" y="${box.bottom + WALTER_LIETH_EXPORT_TEXT.MONTH_LABEL_OFFSET}" text-anchor="middle" font-size="${WALTER_LIETH_EXPORT_TEXT.MONTH_LABEL_FONT_SIZE}" fill="${colors.textSecondary}">${escapeXml(label)}</text>`,
    )
    .join("");

  return `
    ${axes}
    ${ceiling}
    <defs>
      ${patterns}
      <clipPath id="${clipId}"><rect x="${box.left}" y="${box.top}" width="${box.right - box.left}" height="${box.bottom - box.top}" /></clipPath>
    </defs>
    <g clip-path="url(#${clipId})">
      ${layers.map((layer) => buildLayer(layer, { scaleX, scaleY }, colors.bg)).join("")}
    </g>
    ${frost ? buildFrostBand(frost, { colors, scaleX, axisY: box.bottom }) : ""}
    ${labels}`;
}
