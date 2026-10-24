import { PrecipBarShape } from "@/components/charts/PrecipBarShape";
import { toSvgId } from "@/components/charts/charts.util";
import { SeriesHatchPattern } from "@/components/svg";
import { OVERLAY_BAR_STYLES, SERIES_HATCHES } from "@/constants";
import { useId } from "react";
import { BAR_STYLE_PICKER_CLASSES as C, BAR_STYLE_PREVIEW as P } from "../Settings.constant";
import type { TBarStylePreviewProps } from "../Settings.type";
import { getBarStylePreview } from "../Settings.util";

/**
 * A bar style's thumbnail: three months of three entities' bars with the real chart's bar shape,
 * hatch patterns and fills, and a Tmax and a Tmin curve — in the current theme's tokens.
 */
export function BarStylePreview({ barStyle }: TBarStylePreviewProps) {
  const patternPrefix = `bar-style-${toSvgId(useId())}`;
  const { hasHatch } = OVERLAY_BAR_STYLES[barStyle];
  const { bars, curves } = getBarStylePreview(barStyle);

  return (
    <svg
      width={P.WIDTH}
      height={P.HEIGHT}
      viewBox={`0 0 ${P.WIDTH} ${P.HEIGHT}`}
      aria-hidden="true"
      data-bar-style-preview={barStyle}
      className={C.PREVIEW}
    >
      {hasHatch && (
        <defs>
          {SERIES_HATCHES.map((hatch) => (
            <SeriesHatchPattern key={hatch} id={`${patternPrefix}-${hatch}`} hatch={hatch} />
          ))}
        </defs>
      )}
      {bars.map(({ key, hatch, ...bar }) => (
        <PrecipBarShape
          key={key}
          {...bar}
          hatchFill={!hasHatch || hatch === "solid" ? undefined : `url(#${patternPrefix}-${hatch})`}
        />
      ))}
      {curves.map(({ variable, d, stroke, dash, points }) => (
        <g key={variable}>
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={P.CURVE_WIDTH}
            strokeDasharray={dash}
            strokeLinecap="round"
          />
          {points.map(({ x, y }) => (
            <circle key={x} cx={x} cy={y} r={P.POINT_RADIUS} fill={stroke} />
          ))}
        </g>
      ))}
    </svg>
  );
}
