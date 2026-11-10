"use client";

import { CHART_TEXT_MIN_PX } from "@/constants";
import { useTextScale } from "@/hooks/ui/useTextScale";
import { scaleChartFont } from "@/utils/textSize.util";
import { NESTED_CELLS as N } from "./svg.constant";
import type { TNestedCellsIllustrationProps } from "./svg.type";

/**
 * A schematic, not a map: the cells holding one point at two resolutions — a coarse cell among
 * its neighbours, the fine cell inside it, the point in that. Every colour is a theme token.
 */
export function NestedCellsIllustration({
  ariaLabel,
  coarseLabel,
  fineLabel,
  finePerCoarse,
}: TNestedCellsIllustrationProps) {
  const textScale = useTextScale();
  const { x, y, size } = N.COARSE;
  const fine = size / finePerCoarse;
  const fineX = x + fine * N.POINT_CELL.col;
  const fineY = y + fine * N.POINT_CELL.row;
  // * the neighbours' grid lines, continuing the coarse cell's edges to the drawing's borders
  const columns = [x - size, x, x + size, x + size * 2];
  const rows = [y - size, y, y + size, y + size * 2];

  return (
    <svg
      viewBox={`0 0 ${N.WIDTH} ${N.HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      className={N.CLASS}
      fontSize={scaleChartFont({ size: N.FONT_SIZE, textScale, min: CHART_TEXT_MIN_PX.TEXT })}
    >
      <g stroke="var(--color-border)" strokeWidth={N.GRID_STROKE}>
        {columns.map((at) => (
          <line key={`c${at}`} x1={at} y1={0} x2={at} y2={N.HEIGHT} />
        ))}
        {rows.map((at) => (
          <line key={`r${at}`} x1={0} y1={at} x2={N.WIDTH} y2={at} />
        ))}
      </g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        fill="var(--color-primary-muted)"
        stroke="var(--color-primary)"
        strokeWidth={N.COARSE_STROKE}
      />
      <text x={x} y={y - N.COARSE_LABEL_GAP} fill="var(--color-text)" fontWeight={600}>
        {coarseLabel}
      </text>
      <rect
        x={fineX}
        y={fineY}
        width={fine}
        height={fine}
        fill="var(--color-surface)"
        stroke="var(--color-brand)"
        strokeWidth={N.FINE_STROKE}
      />
      <circle
        cx={fineX + fine / 2}
        cy={fineY + fine / 2}
        r={N.POINT_RADIUS}
        fill="var(--color-brand)"
      />
      <text x={x + N.LABEL_INSET} y={fineY + fine + N.FINE_LABEL_GAP} fill="var(--color-text)">
        {fineLabel}
      </text>
    </svg>
  );
}
