import { EWalterLiethRegime } from "@/enums";
import { getRegimeFill, toSvgPath } from "@/utils";
import type { TWalterLiethSegmentPathsProps } from "../WalterLiethChart.type";

/** Segment polygons in their regime fill: hatch lines, arid dots or the solid perhumid fill. */
export function WalterLiethSegmentPaths({
  segments,
  patternIds,
  colors,
  scaleX,
  scaleY,
}: TWalterLiethSegmentPathsProps) {
  return segments.map((segment, i) => (
    <path
      key={`${segment.regime}-${i}`}
      d={toSvgPath({ points: segment.points, scaleX, scaleY })}
      fill={getRegimeFill({
        regime: segment.regime,
        humidPatternUrl: `url(#${patternIds.humid})`,
        aridPatternUrl: `url(#${patternIds.arid})`,
        perhumidColor: colors.perhumid,
      })}
      fillOpacity={segment.regime === EWalterLiethRegime.PERHUMID ? colors.perhumidOpacity : 1}
      stroke="none"
    />
  ));
}
