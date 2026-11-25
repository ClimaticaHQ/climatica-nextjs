import { SeriesHatchIcon, SeriesMarkerIcon } from "@/components/svg";
import { SERIES_MARKER_COLOR } from "@/constants";
import type { TOptionMarkerProps } from "./Dropdown.type";

export function OptionMarker({ shape, hatch, fill }: TOptionMarkerProps) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center gap-0.5"
      style={{ color: SERIES_MARKER_COLOR }}
    >
      {hatch && <SeriesHatchIcon hatch={hatch} fill={fill} />}
      <SeriesMarkerIcon shape={shape} />
    </span>
  );
}
