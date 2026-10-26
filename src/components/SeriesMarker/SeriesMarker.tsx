import { SeriesHatchIcon, SeriesMarkerIcon } from "@/components/svg";
import { SERIES_MARKER_COLOR } from "@/constants";
import type { TSeriesMarkerProps } from "./SeriesMarker.type";

/**
 * An entity's marker: its shape in the neutral graphite — the same as its curves' points — and,
 * where it stands for the bars too, its hatch beside it.
 */
export function SeriesMarker({ shape, hatch, fill }: TSeriesMarkerProps) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      data-series-shape={shape}
      style={{ color: SERIES_MARKER_COLOR }}
    >
      {hatch && <SeriesHatchIcon hatch={hatch} fill={fill} />}
      <SeriesMarkerIcon shape={shape} />
    </span>
  );
}
