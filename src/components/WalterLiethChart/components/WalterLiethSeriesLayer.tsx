import { HatchPatterns } from "@/components/HatchPatterns";
import { WALTER_LIETH_STROKE } from "@/constants";
import { partitionSegmentsByLayer, toSvgPath } from "@/utils";
import type { TWalterLiethSeriesLayerProps } from "../WalterLiethChart.type";
import { WalterLiethCurve } from "./WalterLiethCurve";
import { WalterLiethDot } from "./WalterLiethDot";
import { WalterLiethHalo } from "./WalterLiethHalo";
import { WalterLiethSegmentPaths } from "./WalterLiethSegmentPaths";

/**
 * One series, painted bottom to top: hatching → curve halos → perhumid fill → curves → dots.
 * The export's buildLayer paints in the same order.
 */
export function WalterLiethSeriesLayer({
  layer,
  scaleX,
  scaleY,
  hatchGeometry,
  originX,
  hasSmallDots,
  activeMonthIndex,
}: TWalterLiethSeriesLayerProps) {
  const { rows, segments, patternIds, colors, precDash, dotShape } = layer;
  const { hatched, perhumid } = partitionSegmentsByLayer(segments);
  const paths = { patternIds, colors, scaleX, scaleY };
  const isHighlighting = activeMonthIndex !== null && activeMonthIndex !== undefined;
  const curve = (key: "precAxis" | "tavg") =>
    toSvgPath({
      points: rows.map((row) => ({ x: row.position, y: row[key] })),
      scaleX,
      scaleY,
      isClosed: false,
    });
  const prec = { d: curve("precAxis"), width: WALTER_LIETH_STROKE.PREC_WIDTH };
  const temp = { d: curve("tavg"), width: WALTER_LIETH_STROKE.TEMP_WIDTH };

  return (
    <g>
      <HatchPatterns
        {...patternIds}
        humidColor={colors.humidHatch}
        aridColor={colors.aridHatch}
        geometry={hatchGeometry}
        originX={originX}
      />
      <WalterLiethSegmentPaths segments={hatched} {...paths} />
      <WalterLiethHalo {...prec} />
      <WalterLiethHalo {...temp} />
      <WalterLiethSegmentPaths segments={perhumid} {...paths} />
      <WalterLiethCurve {...prec} color={colors.prec} dash={precDash} />
      <WalterLiethCurve {...temp} color={colors.temp} />
      {rows.map((row) => (
        <WalterLiethDot
          key={row.position}
          x={scaleX(row.position)}
          y={scaleY(row.tavg)}
          shape={dotShape}
          color={colors.temp}
          isActive={row.position === activeMonthIndex}
          isDimmed={isHighlighting && row.position !== activeMonthIndex}
          isSmall={hasSmallDots}
        />
      ))}
    </g>
  );
}
