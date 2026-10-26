import { PRECIP_BAR } from "@/constants";
import { useId } from "react";
import { SeriesHatchPattern } from "./SeriesHatchPattern";
import type { TSeriesHatchIconProps } from "./svg.type";

const SIZE = 10;

/** An entity's bar hatch as a swatch: the humid fill (or its own) with the hatch knocked out of it. */
export function SeriesHatchIcon({ hatch, fill = PRECIP_BAR.HUMID }: TSeriesHatchIconProps) {
  const id = useId();
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      aria-hidden="true"
      data-series-hatch={hatch}
      className="shrink-0"
    >
      <defs>
        <SeriesHatchPattern id={id} hatch={hatch} />
      </defs>
      <rect width={SIZE} height={SIZE} rx={1} fill={fill} />
      {hatch !== "solid" && <rect width={SIZE} height={SIZE} rx={1} fill={`url(#${id})`} />}
    </svg>
  );
}
