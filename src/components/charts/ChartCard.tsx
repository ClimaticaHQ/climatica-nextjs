"use client";

import { Card } from "@/components/Card";
import { ChartTransition } from "@/components/ChartTransition";
import { DataUpdateFade, DataUpdateProgress, useDataUpdate } from "@/components/DataUpdate";
import { useVisibleSeries } from "@/hooks/charts/useVisibleSeries";
import { useIsTouch } from "@/hooks/ui/useIsTouch";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { useSettingsStore } from "@/stores";
import { NO_FLASH_KEYS, SM_MEDIA_QUERY } from "@/constants";
import { ECardPadding, EChartBody } from "@/enums";
import { useId, useState, type ComponentType } from "react";
import { ChartCardHeader } from "./ChartCardHeader";
import { CHART_CARD_CLASS } from "./charts.constant";
import type { TChartBodyProps, TChartCardProps } from "./charts.type";
import { getSeriesKindRule, resolveChartBody } from "./charts.util";
import { ChartDeviceContext } from "./chartDevice.context";
import { OverlayBody } from "./OverlayBody";
import { SingleBody } from "./SingleBody";
import { SplitBody } from "./SplitBody";

const ignoreHighlight = () => undefined;

const CHART_BODIES = {
  [EChartBody.SINGLE]: SingleBody,
  [EChartBody.SPLIT]: SplitBody,
  [EChartBody.OVERLAY]: OverlayBody,
} satisfies Record<EChartBody, ComponentType<TChartBodyProps>>;

/**
 * The chart card, the same for every page: its header (with the toolbar, the same in every view)
 * and the body for the layout — crossfading when the chart type, the layout or the data changes —
 * all derived from the model, the view state and the page's features. A comparison overlay's
 * bars follow the bar style setting, live. On touch the plots take taps — the tapped month's
 * tooltip, pinned over the plot — and a chip never focuses its series (a tap would leave it
 * stuck).
 */
export function ChartCard({ model, viewState, features, onVisibleChange }: TChartCardProps) {
  const series = model.series.map(({ series: entry }) => entry);
  const rule = getSeriesKindRule(series);
  const { visible, setVisible } = useVisibleSeries({
    variables: viewState.variables,
    ...(onVisibleChange ? { onVisibleSeriesChange: onVisibleChange } : {}),
  });
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);
  // * the entity chip hovered or focused (in the header's toolbar): the overlay focuses it
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const barStyle = useSettingsStore((state) => state.chartBarStyle);
  const isTouch = useIsTouch();
  const isNarrow = !useMediaQuery(SM_MEDIA_QUERY);
  const syncId = useId();
  const { update } = useDataUpdate();
  if (!model.hasData) return null;

  const body = resolveChartBody({ viewState, model, rule });
  const Body = CHART_BODIES[body];
  const shared = {
    model,
    rule,
    viewState,
    features,
    barStyle,
    visible,
    onVisibleChange: setVisible,
  };

  return (
    <Card
      // * split panels flash on their own; elsewhere the card flashes for any of its series
      flashKeys={body === EChartBody.SPLIT ? NO_FLASH_KEYS : series.map(({ id }) => id)}
      shouldClip
      // * the same frame on every page; below `sm` a smaller padding, so the plot keeps its width
      padding={ECardPadding.PANEL}
      className={CHART_CARD_CLASS}
    >
      <DataUpdateProgress />
      <ChartCardHeader
        {...shared}
        body={body}
        onHighlight={isTouch ? ignoreHighlight : setHighlightedId}
      />
      <ChartDeviceContext.Provider value={{ isTouch, isNarrow }}>
        <DataUpdateFade>
          <ChartTransition transitionKey={`${viewState.mode}-${body}-${update.id}`}>
            <Body
              {...shared}
              body={body}
              activeMonth={{ activeMonthIndex, onActiveMonthIndexChange: setActiveMonthIndex }}
              syncId={syncId}
              highlightedId={highlightedId}
            />
          </ChartTransition>
        </DataUpdateFade>
      </ChartDeviceContext.Provider>
    </Card>
  );
}
