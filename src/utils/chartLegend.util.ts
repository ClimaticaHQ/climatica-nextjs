import { CHART_LEGEND, CHART_LINE_DASH, CHART_VARIABLE_ORDER } from "@/constants";
import { ELegendSwatch, EWalterLiethSeriesId } from "@/enums";
import type {
  TAridityPalette,
  TLegendItem,
  TLegendSeriesColors,
  TAridityLegendLabels,
  TVariableLegendLabels,
  TLegendSwatch,
  TSeriesKey,
  TSeriesLegendItemsArgs,
  TStandardLegendItemsArgs,
  TStandardSplitLegendItemsArgs,
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
const pair = (a: TLegendSwatch, b: TLegendSwatch): TLegendSwatch => ({
  kind: ELegendSwatch.PAIR,
  a,
  b,
});

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

function aridityItems(
  labels: TAridityLegendLabels,
  aridity: TAridityPalette | null,
): TLegendItem[] {
  if (!aridity) return [];
  return [
    { key: "arid", label: labels.arid, swatch: bar(aridity.arid) },
    { key: "humid", label: labels.humid, swatch: bar(aridity.humid) },
  ];
}

/** The WL frost band's entry: a filled cell in the frost color. */
const frostItem = (labels: TWalterLiethLegendLabels, color: string): TLegendItem => ({
  key: "frost",
  label: labels.frost,
  swatch: bar(color),
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
    frostItem(labels, palette.frost),
  ];
}

/** WL overlay: series by color and marker, variables by line style, regimes when shaded. */
export function getWalterLiethOverlayLegendItems({
  labels,
  series,
  shadeColor,
  frostColor,
  neutral,
}: TWalterLiethOverlayLegendItemsArgs): TLegendItem[] {
  const regimes: TLegendItem[] = shadeColor
    ? [
        {
          key: "humid",
          label: labels.humid,
          swatch: { kind: ELegendSwatch.HUMID, color: shadeColor },
        },
        {
          key: "arid",
          label: labels.arid,
          swatch: { kind: ELegendSwatch.ARID, color: shadeColor },
        },
        {
          key: "perhumid",
          label: labels.perhumid,
          swatch: { kind: ELegendSwatch.PERHUMID, color: shadeColor },
        },
      ]
    : [];
  return [
    ...series.map(({ key, label, color, shape = "circle" }): TLegendItem => ({
      key,
      label,
      swatch: { kind: ELegendSwatch.MARKER, color, shape },
    })),
    { key: "temp", label: labels.temp, swatch: line(neutral) },
    { key: "prec", label: labels.prec, swatch: line(neutral, CHART_LINE_DASH.SERIES.tavg) },
    ...regimes,
    ...(frostColor !== null ? [frostItem(labels, frostColor)] : []),
  ];
}

/** One series' variables in the standard chart's styles — its own color per variable. */
const seriesSwatches = (colors: TLegendSeriesColors) => ({
  tmax: line(colors.tmax),
  tavg: line(colors.tavg, CHART_LINE_DASH.STANDARD.tavg),
  tmin: line(colors.tmin),
  prec: bar(colors.prec),
});

/** Standard single-city chart: its visible variables, then the arid / humid bar colors. */
export function getStandardLegendItems({
  labels,
  colors,
  visible,
  aridity,
}: TStandardLegendItemsArgs): TLegendItem[] {
  const shown = variableItems(labels, visible, seriesSwatches(colors));
  return [...shown, ...(visible.prec ? aridityItems(labels, aridity) : [])];
}

/**
 * Standard split: each visible variable once, with its A and B color side by side — or, with
 * one panel expanded, in that panel's colors only.
 */
export function getStandardSplitLegendItems({
  labels,
  colorsA,
  colorsB,
  visible,
  shown,
}: TStandardSplitLegendItemsArgs): TLegendItem[] {
  if (shown) {
    return variableItems(
      labels,
      visible,
      seriesSwatches(shown === EWalterLiethSeriesId.A ? colorsA : colorsB),
    );
  }
  const { tavg } = CHART_LINE_DASH.STANDARD;
  return variableItems(labels, visible, {
    tmax: pair(line(colorsA.tmax), line(colorsB.tmax)),
    tavg: pair(line(colorsA.tavg, tavg), line(colorsB.tavg, tavg)),
    tmin: pair(line(colorsA.tmin), line(colorsB.tmin)),
    prec: pair(bar(colorsA.prec), bar(colorsB.prec)),
  });
}

/**
 * Multi-series standard charts (overlay compare, multi-period): each series by its dot, then
 * the variables by line style in a neutral color, then the arid / humid bar colors.
 */
export function getSeriesLegendItems({
  labels,
  series,
  visible,
  neutral,
  hasTavg,
  aridity,
}: TSeriesLegendItemsArgs): TLegendItem[] {
  const { tavg, tmin } = CHART_LINE_DASH.SERIES;
  const variables = variableItems(labels, visible, {
    tmax: line(neutral),
    ...(hasTavg ? { tavg: line(neutral, tavg) } : {}),
    tmin: line(neutral, tmin),
    prec: bar(neutral),
  });
  return [
    ...series.map(({ key, label, color, isHidden }): TLegendItem => ({
      key,
      label,
      // * a dot, like the markers on the series' lines — the series' identity entry
      swatch: { kind: ELegendSwatch.MARKER, color, shape: "circle" },
      isMuted: isHidden === true,
    })),
    ...variables,
    ...(visible.prec && aridity ? aridityItems(aridity.labels, aridity.palette) : []),
  ];
}

/** The swatch box for a legend font size — swatches scale with the text (screen and export). */
export const getSwatchSize = (fontSize: number): TSwatchSize => ({
  width: Math.round(fontSize * CHART_LEGEND.SWATCH_WIDTH_RATIO),
  height: Math.round(fontSize * CHART_LEGEND.SWATCH_HEIGHT_RATIO),
});
