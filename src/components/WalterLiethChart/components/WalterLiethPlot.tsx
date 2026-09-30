import { ChartUnitTitles } from "@/components/ChartUnitTitles";
import { CHART_PLOT, WALTER_LIETH_DASH } from "@/constants";
import {
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useWalterLiethAxes } from "../hooks/useWalterLiethAxes";
import type { TWalterLiethPlotProps } from "../WalterLiethChart.type";
import { useElementWidth } from "@/hooks";
import {
  getAxisStyle,
  getMonthLabelFormat,
  resolveActiveTooltipIndex,
  getPlotHeightClass,
  getXAxisProps,
} from "@/utils";
import { WalterLiethFrostBand } from "./WalterLiethFrostBand";
import { WalterLiethHoverBand } from "./WalterLiethHoverBand";
import { WalterLiethLayer } from "./WalterLiethLayer";

/** Recharts shell: shared axes (°C left, mm right, same domain), tooltip, sync, layers. */
export function WalterLiethPlot({
  rows,
  domain,
  layers,
  tooltip,
  isCompact,
  frost,
  syncId,
  activeMonthIndex,
  onActiveMonthIndexChange,
}: TWalterLiethPlotProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const axes = useWalterLiethAxes({ rows, domain, monthFormat: getMonthLabelFormat(width) });
  const { tick, ...axisGeometry } = getAxisStyle(isCompact);
  // * both axes share the domain: precipitation is plotted through the °C scale
  const yAxisBase = {
    domain: [domain.tempMin, domain.plotMax],
    allowDataOverflow: true,
    tick,
    ...axisGeometry,
  };

  return (
    <div ref={ref} className={getPlotHeightClass({ isCompact })}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={rows}
          margin={CHART_PLOT.MARGIN}
          {...(syncId !== undefined ? { syncId } : {})}
          onMouseMove={(state) =>
            onActiveMonthIndexChange?.(resolveActiveTooltipIndex(state.activeTooltipIndex))
          }
          onMouseLeave={() => onActiveMonthIndexChange?.(null)}
        >
          {/* * horizontal only — no month lines, matching the export */}
          <CartesianGrid
            vertical={false}
            strokeDasharray={WALTER_LIETH_DASH.GRID}
            stroke="var(--color-border)"
          />
          <XAxis
            {...getXAxisProps(isCompact)}
            dataKey="position"
            type="number"
            domain={axes.monthAxis.domain}
            ticks={axes.monthAxis.ticks}
            interval={0}
            allowDataOverflow
            tickFormatter={axes.formatMonthTick}
            tick={tick}
          />
          <YAxis
            {...yAxisBase}
            yAxisId="left"
            ticks={axes.tempTicks}
            tickFormatter={axes.formatTempTick}
            // * every °C tick — Recharts would otherwise drop some at small heights, including
            // * the 0 °C tick that marks the shared 0 °C / 0 mm baseline
            interval={0}
          />
          <YAxis
            {...yAxisBase}
            yAxisId="right"
            orientation="right"
            ticks={axes.precTicks}
            // * the compressed zone above 100 mm packs many ticks — thin them, keep both ends
            interval="preserveStartEnd"
            tickFormatter={axes.formatPrecTick}
          />
          {/* * the hovered month's band — the same color as the monthly values table's */}
          <Customized
            component={WalterLiethHoverBand}
            activeMonthIndex={activeMonthIndex}
            yMin={domain.tempMin}
            yMax={domain.plotMax}
          />
          <ChartUnitTitles isCompact={isCompact} />
          <Tooltip content={tooltip} cursor={false} />
          {/* * invisible: they only register the rows with each axis for tooltip and sync */}
          <Line yAxisId="left" dataKey="tavg" stroke="none" dot={false} activeDot={false} />
          <Line yAxisId="right" dataKey="precAxis" stroke="none" dot={false} activeDot={false} />
          <Customized
            component={WalterLiethLayer}
            layers={layers}
            xDomain={axes.monthAxis.domain}
            tempCeiling={domain.plotMax > domain.tempMax ? domain.tempMax : null}
            hasSmallDots={axes.isSmallScreen}
            activeMonthIndex={activeMonthIndex}
          />
          {frost && (
            <Customized
              component={WalterLiethFrostBand}
              frost={frost}
              axisValue={domain.tempMin}
              isCompact={isCompact}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
