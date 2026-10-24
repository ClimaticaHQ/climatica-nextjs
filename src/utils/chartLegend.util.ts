import { CHART_LEGEND, CHART_LINE_DASH, CHART_VARIABLE_ORDER } from "@/constants";
import { ELegendSwatch } from "@/enums";
import type {
  TAridityPalette,
  TLegendFrostColors,
  TLegendItem,
  TLegendSeriesColors,
  TAridityLegendLabels,
  TVariableLegendLabels,
  TLegendSwatch,
  TSeriesKey,
  TSeriesLegendItemsArgs,
  TStandardLegendItemsArgs,
  TLegendSeries,
  TSwatchSize,
  TVisibleSeries,
  TWalterLiethLegendItemsArgs,
  TWalterLiethLegendLabels,
  TWalterLiethOverlayLegendItemsArgs,
} from "@/types";

// * the legend items of every chart type — the screen (CSS-var colors) and the export
// * (resolved colors) build them here, so both always list the same entries

const line = (color: string, dash?: string): TLegendSwatch => ({
  kind: ELegendSwatch.LINE,
  color,
  dash,
});
const bar = (color: string): TLegendSwatch => ({ kind: ELegendSwatch.BAR, color });

/** Variable entries (tmax, tavg, tmin, prec) the chart shows — hidden ones drop out. */
function variableItems(
  labels: TVariableLegendLabels,
  visible: TVisibleSeries,
  swatches: Partial<Record<TSeriesKey, TLegendSwatch>>,
): TLegendItem[] {
  return CHART_VARIABLE_ORDER.flatMap((key) => {
    const swatch = swatches[key];
    return swatch && visible[key] ? [{ key, label: labels[key], swatch }] : [];
  });
}

/** A month's bar swatch when bars are coloured by aridity: its legend entry's (arid / humid). */
export const getAridityBarSwatch = (palette: TAridityPalette, isArid: boolean) =>
  bar(isArid ? palette.arid : palette.humid);

// * the bars by aridity — humid first: they stand for precipitation, so it has no entry of its own
function aridityItems(labels: TAridityLegendLabels, aridity: TAridityPalette): TLegendItem[] {
  return [
    { key: "humid", label: labels.humid, swatch: bar(aridity.humid) },
    { key: "arid", label: labels.arid, swatch: bar(aridity.arid) },
  ];
}

/** Entities by shape — and by hatch beside it where the chart draws their bars. */
const markerItems = (
  series: readonly TLegendSeries[],
  markerColor: string,
  bars?: { fill: string; hatchColor: string },
) =>
  series.map(({ key, label, shape, hatch, fill, isHidden }): TLegendItem => ({
    key,
    label,
    swatch:
      hatch && bars
        ? {
            kind: ELegendSwatch.ENTITY,
            color: markerColor,
            shape,
            hatch,
            ...bars,
            ...(fill !== undefined ? { fill } : {}),
          }
        : { kind: ELegendSwatch.MARKER, color: markerColor, shape },
    isMuted: isHidden === true,
  }));

/** The WL frost band's entry: a cell like the band's — frost-filled, outlined. */
const frostItem = (
  labels: TWalterLiethLegendLabels,
  { fill, outline }: TLegendFrostColors,
): TLegendItem => ({
  key: "frost",
  label: labels.frost,
  swatch: { kind: ELegendSwatch.FROST, color: fill, outline },
});

/** WL diagram (single and split): the two curves, the three regimes and the frost band. */
export function getWalterLiethLegendItems({
  labels,
  palette,
}: TWalterLiethLegendItemsArgs): TLegendItem[] {
  return [
    { key: "temp", label: labels.temp, swatch: line(palette.temp) },
    { key: "prec", label: labels.prec, swatch: line(palette.prec) },
    {
      key: "humid",
      label: labels.humid,
      swatch: { kind: ELegendSwatch.HUMID, color: palette.humidHatch },
    },
    {
      key: "arid",
      label: labels.arid,
      swatch: { kind: ELegendSwatch.ARID, color: palette.aridHatch },
    },
    {
      key: "perhumid",
      label: labels.perhumid,
      swatch: { kind: ELegendSwatch.PERHUMID, color: palette.perhumid },
    },
    frostItem(labels, { fill: palette.frost, outline: palette.frostOutline }),
  ];
}

/**
 * WL overlay: the entities by shape, the curves in the diagram's semantic colours, and the
 * regimes and frost band of the hatched series when there is one.
 */
export function getWalterLiethOverlayLegendItems({
  labels,
  series,
  palette,
  isShaded,
  markerColor,
}: TWalterLiethOverlayLegendItemsArgs): TLegendItem[] {
  const [temp, prec, ...shaded] = getWalterLiethLegendItems({ labels, palette });
  return [
    ...markerItems(series, markerColor),
    ...(temp ? [temp] : []),
    ...(prec ? [{ ...prec, swatch: line(palette.prec, CHART_LINE_DASH.SERIES.tavg) }] : []),
    ...(isShaded ? shaded : []),
  ];
}

/** One series' variables in the standard chart's styles — its own color per variable. */
export const getStandardVariableSwatches = (colors: TLegendSeriesColors) => ({
  tmax: line(colors.tmax),
  tavg: line(colors.tavg, CHART_LINE_DASH.STANDARD.tavg),
  tmin: line(colors.tmin, CHART_LINE_DASH.STANDARD.tmin),
  prec: bar(colors.prec),
});

/**
 * Standard chart, one entity or side by side (every panel in the same semantic colours): its
 * visible lines, then the bars' humid / arid fills.
 */
export function getStandardLegendItems({
  labels,
  colors,
  visible,
  aridity,
}: TStandardLegendItemsArgs): TLegendItem[] {
  const { tmax, tavg, tmin } = getStandardVariableSwatches(colors);
  const shown = variableItems(labels, visible, { tmax, tavg, tmin });
  return [...shown, ...(visible.prec ? aridityItems(labels, aridity) : [])];
}

/**
 * Overlay: each entity by its bars' hatch and its points' shape, then the lines in their
 * semantic colours and the overlay's dashes, then the bars' humid / arid fills.
 */
export function getSeriesLegendItems({
  labels,
  series,
  visible,
  colors,
  aridity,
  markerColor,
  hatchColor,
  hasTavg,
}: TSeriesLegendItemsArgs): TLegendItem[] {
  const { tavg, tmin } = CHART_LINE_DASH.SERIES;
  const lines = variableItems(labels, visible, {
    tmax: line(colors.tmax),
    ...(hasTavg ? { tavg: line(colors.tavg, tavg) } : {}),
    tmin: line(colors.tmin, tmin),
  });
  return [
    ...markerItems(series, markerColor, { fill: aridity.humid, hatchColor }),
    ...lines,
    ...(visible.prec ? aridityItems(labels, aridity) : []),
  ];
}

/** A swatch's own width: an entity's is two squares (hatch, shape) side by side. */
export const getLegendSwatchWidth = (swatch: TLegendSwatch, size: TSwatchSize) =>
  swatch.kind === ELegendSwatch.ENTITY ? size.height * 2 + CHART_LEGEND.ENTITY_GAP : size.width;

/** The swatch box for a legend font size — swatches scale with the text (screen and export). */
export const getSwatchSize = (fontSize: number): TSwatchSize => ({
  width: Math.round(fontSize * CHART_LEGEND.SWATCH_WIDTH_RATIO),
  height: Math.round(fontSize * CHART_LEGEND.SWATCH_HEIGHT_RATIO),
});
