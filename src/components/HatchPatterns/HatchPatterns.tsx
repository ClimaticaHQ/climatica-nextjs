import { WALTER_LIETH_HATCH } from "@/constants";
import type { THatchPatternsProps } from "./HatchPatterns.type";

/**
 * WL regime patterns — humid = thin vertical lines, arid = dots in the same columns. Used by
 * the diagram and by legend swatches. Geometry comes from
 * getHatchGeometry (derived from the month width), exactly like the export's
 * buildWalterLiethPatterns, so screen and PNG match.
 */
export function HatchPatterns({
  humid,
  arid,
  humidColor,
  aridColor,
  geometry,
  originX,
}: THatchPatternsProps) {
  const { spacing, dotRadius, dotRowHeight } = geometry;
  const column = spacing / 2;

  return (
    <defs>
      <pattern
        id={humid}
        x={originX}
        width={spacing}
        height={spacing}
        patternUnits="userSpaceOnUse"
      >
        <line
          x1={column}
          y1={0}
          x2={column}
          y2={spacing}
          stroke={humidColor}
          strokeWidth={WALTER_LIETH_HATCH.HUMID_STROKE_WIDTH}
        />
      </pattern>
      <pattern
        id={arid}
        x={originX}
        width={spacing}
        height={dotRowHeight}
        patternUnits="userSpaceOnUse"
      >
        <circle cx={column} cy={dotRowHeight / 2} r={dotRadius} fill={aridColor} />
      </pattern>
    </defs>
  );
}
