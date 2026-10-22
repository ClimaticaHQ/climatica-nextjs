import { getMarkerPath } from "@/utils/seriesShape.util";
import type { TSeriesMarkerIconProps } from "./svg.type";

const SIZE = 14;
const SHAPE_SIZE = 9;

/** An entity's marker shape (SERIES_SHAPES), drawn in currentColor. */
export function SeriesMarkerIcon({ shape }: TSeriesMarkerIconProps) {
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none" aria-hidden="true">
      <path
        d={getMarkerPath({ shape, cx: SIZE / 2, cy: SIZE / 2, size: SHAPE_SIZE })}
        fill="currentColor"
      />
    </svg>
  );
}
