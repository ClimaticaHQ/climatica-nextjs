import { SeriesHatchIcon, SeriesMarkerIcon } from "@/components/svg";
import { SERIES_MARKER_COLOR } from "@/constants";
import type { TOptionMarkerProps } from "./Dropdown.type";

/**
 * An entity's shape before a label, in graphite — and its bars' hatch before it where the label
 * stands for the bars too. Decorative; the label carries the meaning.
 */
export function OptionMarker({ shape, hatch }: TOptionMarkerProps) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center gap-0.5"
      style={{ color: SERIES_MARKER_COLOR }}
    >
      {hatch && <SeriesHatchIcon hatch={hatch} />}
      <SeriesMarkerIcon shape={shape} />
    </span>
  );
}
