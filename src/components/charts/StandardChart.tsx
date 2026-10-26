import { SeriesHatchPattern } from "@/components/svg";
import {
  CHART_HOVER_COLOR,
  CHART_PLOT,
  DEFAULT_BAR_STYLE,
  MONTH_NAMES,
  OVERLAY_BAR_STYLES,
  SERIES_HATCHES,
} from "@/constants";
import { useOverlayFocus } from "@/hooks/charts/useOverlayFocus";
import { useScrollSync } from "@/hooks/charts/useScrollSync";
import { useSeriesToggleMotion } from "@/hooks/charts/useSeriesToggleMotion";
import { useDelayedHide } from "@/hooks/ui/useDelayedHide";
import { useElementWidth } from "@/hooks/ui/useElementWidth";
import {
  getMonthLabelFormat,
  getFixedOverlayBarLayout,
  getOverlayBarLayout,
  getOverlayScroll,
  getPhoneOverlayBars,
  resolveActiveTooltipIndex,
  getPlotMargin,
  getTouchTooltipKey,
  getTouchTooltipProps,
} from "@/utils";
import { useTranslations } from "next-intl";
import { useContext, useId, useState } from "react";
import { ComposedChart, ReferenceArea, ResponsiveContainer, Tooltip } from "recharts";
import { ChartFocusContext } from "./chartFocus.context";
import { ChartScrollContext } from "./chartScroll.context";
import {
  OVERLAY_SCROLL_CLASSES as S,
  SERIES_ITEM_SEPARATOR,
  STANDARD_CHART_LINES,
} from "./charts.constant";
import type { TStandardChartProps } from "./charts.type";
import { getCurveOffsets, toSvgId } from "./charts.util";
import { ChartDeviceContext } from "./chartDevice.context";
import { MonthTapLayer } from "./MonthTapLayer";
import { FixedYAxes } from "./FixedYAxes";
import { OverlayBars } from "./OverlayBars";
import { OverlayCurves } from "./OverlayCurves";
import { StandardChartAxes } from "./StandardChartAxes";
import { StandardTooltip } from "./StandardTooltip";

/**
 * Every series in one standard chart (the overlay): the bar layer and the curve layer, each
 * entity's curve points over its own bars (one bar layout for both). An entity focused — its
 * chip, a curve, a bar or its marker in the values table — keeps its colours, the rest turn
 * gray. Bars too narrow even at their minimum: the plot scrolls sideways under fixed y axes, the
 * values table below with it.
 */
export function StandardChart({
  entries,
  barStyle = DEFAULT_BAR_STYLE,
  rows,
  hasMeanLine,
  scales,
  rightMax,
  visible,
  selectedMonths,
  highlightedId,
  activeMonth: { activeMonthIndex, onActiveMonthIndexChange },
  footer,
}: TStandardChartProps) {
  const t = useTranslations();
  const seriesMotion = useSeriesToggleMotion();
  const { isTouch, isNarrow } = useContext(ChartDeviceContext);
  // * touch, scrolling sideways: the tooltip pins over the visible part
  const [scrollLeft, setScrollLeft] = useState(0);
  const { ref: plotRef, width: availableWidth } = useElementWidth<HTMLDivElement>();
  const { register } = useScrollSync();
  const patternPrefix = `hatch-${toSvgId(useId())}`;
  const hidePrecBar = useDelayedHide(!visible.prec, seriesMotion.toggleMs);
  const hidden = {
    tmax: useDelayedHide(!visible.tmax, seriesMotion.toggleMs),
    tavg: useDelayedHide(!visible.tavg, seriesMotion.toggleMs),
    tmin: useDelayedHide(!visible.tmin, seriesMotion.toggleMs),
  };
  const lines = STANDARD_CHART_LINES.filter(({ variable }) => hasMeanLine || variable !== "tavg");
  const { focus, setFocus, tooltipFocus } = useOverlayFocus({
    entries,
    rows,
    lines,
    activeMonthIndex,
  });
  const shown = entries.filter(({ isHidden }) => !isHidden);
  const { gap, minGap, hasHatch } = OVERLAY_BAR_STYLES[barStyle];
  // * a phone: fixed, roomy bars — the year scrolls sideways when it doesn't fit
  const phoneBars = isNarrow ? getPhoneOverlayBars(shown.length) : null;
  const scroll = getOverlayScroll({
    availableWidth: availableWidth ?? 0,
    entityCount: shown.length,
    gap,
    minGap,
    isNarrow,
    ...(phoneBars ? { minBand: phoneBars.band } : {}),
  });
  const layout = phoneBars
    ? getFixedOverlayBarLayout({
        plotWidth: scroll.plotWidth,
        entityCount: shown.length,
        ...phoneBars,
      })
    : getOverlayBarLayout({
        plotWidth: scroll.plotWidth,
        entityCount: shown.length,
        gap,
        minGap,
      });
  // * a chip's highlight, else the curve or bar pointed at; a hidden entity is never focused
  const candidate = highlightedId ?? focus?.id ?? null;
  const focusedId = shown.some(({ id }) => id === candidate) ? candidate : null;
  const layer = {
    entries,
    visible,
    selectedMonths,
    activeMonthIndex,
    focusedId,
    onFocus: setFocus,
  };

  const markerOf = (name: string) =>
    entries.find(({ label }) => name.startsWith(`${label}${SERIES_ITEM_SEPARATOR}`))?.marker;
  const localMonthName = (value: unknown) => {
    const index = (MONTH_NAMES as readonly string[]).indexOf(String(value));
    return index >= 0 ? t(`months.${index + 1}`) : String(value);
  };

  const tooltipState = {
    isTouch,
    activeMonthIndex,
    ...(scroll.isOverflowing ? { visibleLeft: scrollLeft + getPlotMargin(false, isNarrow) } : {}),
  };
  // * scrolling sideways, the plot keeps its own drag: months by tap only
  const tapLayer = isTouch && (
    <MonthTapLayer
      activeMonthIndex={activeMonthIndex}
      onActiveMonthIndexChange={onActiveMonthIndexChange}
      inset={getPlotMargin(false, isNarrow)}
      canScrub={!scroll.isOverflowing}
    />
  );
  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        // * Recharts places series in the order they first mount — a series whose data
        // * lands late would go last; a new set of series remounts the chart in order
        key={entries.map(({ id }) => id).join("|")}
        data={rows}
        margin={CHART_PLOT.MARGIN}
        barSize={layout.barSize}
        barGap={layout.gap}
        onMouseMove={(state) =>
          onActiveMonthIndexChange?.(resolveActiveTooltipIndex(state.activeTooltipIndex))
        }
        onMouseLeave={() => {
          onActiveMonthIndexChange?.(null);
          setFocus(null);
        }}
      >
        <StandardChartAxes
          scales={scales}
          rightMax={rightMax}
          isCompact={false}
          monthFormat={getMonthLabelFormat(scroll.contentWidth, isNarrow)}
          // * scrolling: the fixed axes hold °C and mm — the plot's own would slide out under them
          shouldShowUnitTitles={!scroll.isOverflowing}
        />
        {activeMonthIndex !== null && (
          // * the hovered month's band — the same colour as the monthly values table's
          <ReferenceArea
            yAxisId="temp"
            x1={MONTH_NAMES[activeMonthIndex]}
            x2={MONTH_NAMES[activeMonthIndex]}
            fill={CHART_HOVER_COLOR}
            fillOpacity={1}
            stroke="none"
          />
        )}
        {/* * on touch, the tapped month's — every shown entity's values */}
        <Tooltip
          key={getTouchTooltipKey(tooltipState)}
          cursor={false}
          {...getTouchTooltipProps(tooltipState)}
          content={
            <StandardTooltip
              formatLabel={localMonthName}
              markerOf={markerOf}
              focus={isTouch ? null : tooltipFocus}
            />
          }
        />
        <OverlayBars
          {...layer}
          isHidden={hidePrecBar}
          hasHatch={hasHatch}
          patternPrefix={patternPrefix}
        />
        <OverlayCurves
          {...layer}
          lines={lines}
          hidden={hidden}
          offsets={getCurveOffsets(shown, layout)}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <ChartScrollContext.Provider
      value={scroll.isOverflowing ? { contentWidth: scroll.contentWidth, register } : null}
    >
      <ChartFocusContext.Provider
        value={{
          focusedId,
          onEntityFocus: (id) => setFocus(id === null ? null : { id, target: "entity" }),
        }}
      >
        <div ref={plotRef} className={`${S.ROOT} ${CHART_PLOT.HEIGHT.FULL}`}>
          <svg aria-hidden width={0} height={0} className="absolute">
            <defs>
              {SERIES_HATCHES.map((hatch) => (
                <SeriesHatchPattern key={hatch} id={`${patternPrefix}-${hatch}`} hatch={hatch} />
              ))}
            </defs>
          </svg>
          {scroll.isOverflowing ? (
            <>
              <div
                ref={register}
                data-overlay-scroller
                className={`h-full ${S.SCROLLER}`}
                {...(isTouch
                  ? { onScroll: (event) => setScrollLeft(event.currentTarget.scrollLeft) }
                  : {})}
              >
                <div className="relative h-full" style={{ width: scroll.contentWidth }}>
                  {chart}
                  {tapLayer}
                </div>
              </div>
              <FixedYAxes scales={scales} rightMax={rightMax} rows={rows} />
            </>
          ) : (
            <div className="relative h-full">
              {chart}
              {tapLayer}
            </div>
          )}
        </div>
        {scroll.isOverflowing && <p className={S.HINT}>{t("chart.scrollHint")}</p>}
        {footer}
      </ChartFocusContext.Provider>
    </ChartScrollContext.Provider>
  );
}
