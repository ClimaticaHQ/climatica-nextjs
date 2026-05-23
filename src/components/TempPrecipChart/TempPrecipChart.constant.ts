import type { TWalterLiethColors } from "./TempPrecipChart.type";

export const WL_COLORS_A: TWalterLiethColors = {
  humidFill: "var(--color-wl-humid-fill)",
  aridFill: "var(--color-wl-arid-fill)",
  humidFillOpacity: 0.85,
  aridFillOpacity: 0.9,
  tempLineColor: "var(--color-wl-temp-line-a)",
  precLineColor: "var(--color-wl-prec-line-a)",
};

export const WL_COLORS_B: TWalterLiethColors = {
  humidFill: "var(--color-wl-humid-fill)",
  aridFill: "var(--color-wl-arid-fill)",
  humidFillOpacity: 0.6,
  aridFillOpacity: 0.65,
  tempLineColor: "var(--color-wl-temp-line-b)",
  precLineColor: "var(--color-wl-prec-line-b)",
};

export const CHART_COLORS = {
  arid: "var(--chart-arid)",
  humid: "var(--chart-humid)",
  single: {
    tmax: "var(--chart-temp-max)",
    tmin: "var(--chart-temp-min)",
    tavg: "var(--chart-temp-avg)",
  },
  compareA: {
    tmax: "var(--chart-compare-a-max)",
    tmin: "var(--chart-compare-a-min)",
    prec: "var(--chart-compare-a-prec)",
    tavg: "var(--chart-compare-a-tavg)",
  },
  compareB: {
    tmax: "var(--chart-compare-b-max)",
    tmin: "var(--chart-compare-b-min)",
    prec: "var(--chart-compare-b-prec)",
    tavg: "var(--chart-compare-b-tavg)",
  },
  wl: {
    tempStroke: "var(--color-wl-temp-line-a)",
    precStroke: "var(--color-wl-prec-line-a)",
    humidFill: "var(--color-wl-humid-fill)",
    aridFill: "var(--color-wl-arid-fill)",
    aridTooltip: "var(--color-wl-arid-tooltip)",
    humidTooltip: "var(--color-wl-prec-line-b)",
  },
};
