import { SeriesHatchIcon, SeriesMarkerIcon } from "@/components/svg";
import { SERIES_MARKER_COLOR } from "@/constants";
import type { TSeriesMarkerProps } from "./SeriesMarker.type";

export function SeriesMarker({
  shape,
  hatch,
  fill,
  color = SERIES_MARKER_COLOR,
}: TSeriesMarkerProps) {
  return (
    <span className="inline-flex items-center gap-0.5" data-series-shape={shape} style={{ color }}>
      {hatch && <SeriesHatchIcon hatch={hatch} fill={fill} />}
      <SeriesMarkerIcon shape={shape} />
    </span>
  );
}
