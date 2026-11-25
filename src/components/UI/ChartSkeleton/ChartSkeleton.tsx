import {
  CHART_SKELETON_BARS,
  CHART_SKELETON_CLASSES as C,
  CHART_SKELETON_CURVE,
  CHART_SKELETON_CURVE_STYLE as S,
  CHART_SKELETON_GRID_LINES,
} from "./ChartSkeleton.constant";
import type { TChartSkeletonProps } from "./ChartSkeleton.type";

export function ChartSkeleton({ heightClass }: TChartSkeletonProps) {
  return (
    <div aria-hidden data-chart-skeleton className={`${C.ROOT} ${heightClass}`}>
      <div className={C.PLOT}>
        {CHART_SKELETON_GRID_LINES.map((top) => (
          <div key={top} className={C.GRID} style={{ top }} />
        ))}
        <div className={C.BARS}>
          {CHART_SKELETON_BARS.map((height, month) => (
            <div key={month} className={C.BAR} style={{ height: `${height}%` }} />
          ))}
        </div>
        <svg viewBox={S.VIEW_BOX} preserveAspectRatio="none" className={C.CURVE}>
          <polyline
            points={CHART_SKELETON_CURVE}
            fill="none"
            stroke={S.STROKE}
            strokeWidth={S.STROKE_WIDTH}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
