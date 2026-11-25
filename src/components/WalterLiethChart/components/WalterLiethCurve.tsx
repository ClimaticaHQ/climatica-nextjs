import type { TWalterLiethCurveProps } from "../WalterLiethChart.type";

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
