import { linearPath } from "@/components/TempPrecipChart/utils/catmullRomPath";
import { useXAxisScale, useYAxisScale } from "recharts";
import { WL_COLORS_A } from "../WalterLiethChart.constant";
import type { TWLCustomizedProps } from "../WalterLiethChart.type";

// Renders Walter-Lieth fills and curves via SVG clipPath (even-odd winding rule).
// Uses recharts v3 hooks to access the chart's coordinate systems.
export function WalterLiethCustomized({
  wlData,
  wlScales,
  colors = WL_COLORS_A,
  clipId = "wl-clip-diff",
  opacity = 1,
  dashArray,
}: TWLCustomizedProps) {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale("left");

  if (!xScale || !yScale || wlData.length === 0) return null;

  const isPoint = (p: {
    x: number | undefined;
    y: number | undefined;
  }): p is { x: number; y: number } => p.x !== undefined && p.y !== undefined;

  const tempRaw = wlData.map((d) => ({
    x: xScale(d.monthName, { position: "middle" }),
    y: yScale(d.tavg),
  }));
  const precRaw = wlData.map((d) => ({
    x: xScale(d.monthName, { position: "middle" }),
    y: yScale(d.precScaled),
  }));
  const baselineRaw = yScale(wlScales?.tempMin ?? 0);

  const tempPts = tempRaw.filter(isPoint);
  const precPts = precRaw.filter(isPoint);

  if (
    tempPts.length !== wlData.length ||
    precPts.length !== wlData.length ||
    baselineRaw === undefined
  )
    return null;

  const baselineY = baselineRaw;
  const firstX = tempPts[0].x;
  const lastX = tempPts[tempPts.length - 1].x;

  const tempLine = linearPath(tempPts);
  const precLine = linearPath(precPts);

  const f = (n: number) => n.toFixed(2);
  const tempArea = `${tempLine} L ${f(lastX)},${f(baselineY)} L ${f(firstX)},${f(baselineY)} Z`;
  const precArea = `${precLine} L ${f(lastX)},${f(baselineY)} L ${f(firstX)},${f(baselineY)} Z`;

  const diffPath = `${precArea} ${tempArea}`;

  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={diffPath} clipRule="evenodd" />
        </clipPath>
      </defs>
      <path
        d={precArea}
        fill={colors.humidFill}
        fillOpacity={colors.humidFillOpacity ?? 0.85}
        clipPath={`url(#${clipId})`}
        stroke="none"
      />
      <path
        d={tempArea}
        fill={colors.aridFill}
        fillOpacity={colors.aridFillOpacity ?? 0.9}
        clipPath={`url(#${clipId})`}
        stroke="none"
      />
      <path
        d={precLine}
        fill="none"
        stroke={colors.precLineColor}
        strokeWidth={1.5}
        strokeDasharray={dashArray}
      />
      <path
        d={tempLine}
        fill="none"
        stroke={colors.tempLineColor}
        strokeWidth={2}
        strokeDasharray={dashArray}
      />
      {!dashArray &&
        tempPts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={colors.tempLineColor}
            stroke="white"
            strokeWidth={1}
          />
        ))}
    </g>
  );
}
