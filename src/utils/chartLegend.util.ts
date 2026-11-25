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

const line = (color: string, dash?: string): TLegendSwatch => ({
  kind: ELegendSwatch.LINE,
  color,
  dash,
});
const bar = (color: string): TLegendSwatch => ({ kind: ELegendSwatch.BAR, color });

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

export const getAridityBarSwatch = (palette: TAridityPalette, isArid: boolean) =>
  bar(isArid ? palette.arid : palette.humid);

function aridityItems(labels: TAridityLegendLabels, aridity: TAridityPalette): TLegendItem[] {
  return [
    { key: "humid", label: labels.humid, swatch: bar(aridity.humid) },
    { key: "arid", label: labels.arid, swatch: bar(aridity.arid) },
  ];
}

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

const frostItem = (
  labels: TWalterLiethLegendLabels,
  { fill, outline }: TLegendFrostColors,
): TLegendItem => ({
  key: "frost",
  label: labels.frost,
  swatch: { kind: ELegendSwatch.FROST, color: fill, outline },
});

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

export const getStandardVariableSwatches = (colors: TLegendSeriesColors) => ({
  tmax: line(colors.tmax),
  tavg: line(colors.tavg, CHART_LINE_DASH.STANDARD.tavg),
  tmin: line(colors.tmin, CHART_LINE_DASH.STANDARD.tmin),
  prec: bar(colors.prec),
});

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

export const getLegendSwatchWidth = (swatch: TLegendSwatch, size: TSwatchSize) =>
  swatch.kind === ELegendSwatch.ENTITY ? size.height * 2 + CHART_LEGEND.ENTITY_GAP : size.width;

export const getSwatchSize = (fontSize: number): TSwatchSize => ({
  width: Math.round(fontSize * CHART_LEGEND.SWATCH_WIDTH_RATIO),
  height: Math.round(fontSize * CHART_LEGEND.SWATCH_HEIGHT_RATIO),
});
