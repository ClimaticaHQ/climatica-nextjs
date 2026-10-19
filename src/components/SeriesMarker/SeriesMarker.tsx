import { SeriesMarkerIcon } from "@/components/svg";
import { WALTER_LIETH_COMPARISON } from "@/constants";
import { getPairIdentityColor } from "@/utils/seriesColor.util";
import type { TSeriesMarkerProps } from "./SeriesMarker.type";

/** A series' marker in its color — the same identity as its dots in the diagram. */
export function SeriesMarker({ id, color }: TSeriesMarkerProps) {
  return (
    <span className="inline-flex" style={{ color: color ?? getPairIdentityColor(id) }}>
      <SeriesMarkerIcon shape={WALTER_LIETH_COMPARISON.DOT_SHAPE[id]} />
    </span>
  );
}
