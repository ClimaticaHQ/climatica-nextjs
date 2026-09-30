import type { TWalterLiethCurveProps } from "../WalterLiethChart.type";

/** A curve's stroke. Its halo (WalterLiethHalo) is painted earlier, under the perhumid fill. */
export function WalterLiethCurve({ d, color, width, dash }: TWalterLiethCurveProps) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinejoin="round"
      {...(dash !== undefined ? { strokeDasharray: dash } : {})}
    />
  );
}
