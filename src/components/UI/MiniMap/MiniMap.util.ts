import { SERIES_MARKER_COLOR, SERIES_SHAPES } from "@/constants";
import type { TSeriesShape } from "@/types";
import { getMarkerPath } from "@/utils/seriesShape.util";
import L from "leaflet";
import { MINI_MAP_MARKER as M } from "./MiniMap.constant";

/** A place's map icon: its shape (the first one for a place that is no entity), as on the charts. */
export function getMiniMapIcon(shape: TSeriesShape = SERIES_SHAPES[0], isActive: boolean) {
  const size = isActive ? M.ACTIVE_SIZE : M.SIZE;
  const box = size + M.OUTLINE_WIDTH * 2;
  const centre = box / 2;
  const path = getMarkerPath({ shape, cx: centre, cy: centre, size });
  return L.divIcon({
    className: "",
    iconSize: [box, box],
    iconAnchor: [centre, centre],
    html: `<svg width="${box}" height="${box}" viewBox="0 0 ${box} ${box}" aria-hidden="true"><path d="${path}" fill="${SERIES_MARKER_COLOR}" stroke="${M.OUTLINE}" stroke-width="${M.OUTLINE_WIDTH}" stroke-linejoin="round" /></svg>`,
  });
}
