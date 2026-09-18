/** Precip Bar's animationDuration and its useDelayedHide() delay must stay
 * equal — the hide transition (which excludes the bar from tooltip/legend)
 * should only kick in once the shrink animation has visibly finished. */
export const PRECIP_BAR_ANIMATION_DURATION_MS = 400;

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
