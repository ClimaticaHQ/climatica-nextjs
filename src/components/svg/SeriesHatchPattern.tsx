import { SERIES_HATCH_COLOR, SERIES_HATCH_GEOMETRY as H } from "@/constants";
import { getHatchTile } from "@/utils/seriesShape.util";
import type { TSeriesHatchPatternProps } from "./svg.type";

export function SeriesHatchPattern({ id, hatch }: TSeriesHatchPatternProps) {
  const tile = getHatchTile(hatch);
  if (!tile) return null;
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={H.TILE} height={H.TILE}>
      {tile.paint === "stroke" ? (
        <path d={tile.d} stroke={SERIES_HATCH_COLOR} strokeWidth={H.STROKE} fill="none" />
      ) : (
        <path d={tile.d} fill={SERIES_HATCH_COLOR} />
      )}
    </pattern>
  );
}
