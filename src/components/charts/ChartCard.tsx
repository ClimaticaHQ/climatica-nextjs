"use client";

import { Card } from "@/components/Card";
import { ChartTransition } from "@/components/ChartTransition";
import { DataUpdateFade, DataUpdateProgress, useDataUpdate } from "@/components/DataUpdate";
import { useVisibleSeries } from "@/hooks/charts/useVisibleSeries";
import { useIsTouch } from "@/hooks/ui/useIsTouch";
import { useMediaQuery } from "@/hooks/ui/useMediaQuery";
import { useTextScale } from "@/hooks/ui/useTextScale";
import { useSettingsStore } from "@/stores";
import { NO_FLASH_KEYS, SM_MEDIA_QUERY } from "@/constants";
import { ECardPadding, EChartBody } from "@/enums";
import { useContext, useId, useState, type ComponentType } from "react";
import { ChartCardHeader } from "./ChartCardHeader";
import { CHART_CARD_CLASS } from "./charts.constant";
import type { TChartBodyProps, TChartCardProps } from "./charts.type";
import { getSeriesKindRule, resolveChartBody } from "./charts.util";
import { ChartDeviceContext } from "./chartDevice.context";
import { ChartLoadingContext } from "./chartLoading.context";
import { OverlayBody } from "./OverlayBody";
import { SingleBody } from "./SingleBody";
import { SplitBody } from "./SplitBody";

const ignoreHighlight = () => undefined;

const CHART_BODIES = {
  [EChartBody.SINGLE]: SingleBody,
  [EChartBody.SPLIT]: SplitBody,
  [EChartBody.OVERLAY]: OverlayBody,
} satisfies Record<EChartBody, ComponentType<TChartBodyProps>>;

export function ChartCard({ model, viewState, features, onVisibleChange }: TChartCardProps) {
  const series = model.series.map(({ series: entry }) => entry);
  const rule = getSeriesKindRule(series);
  const { visible, setVisible } = useVisibleSeries({
    variables: viewState.variables,
    ...(onVisibleChange ? { onVisibleSeriesChange: onVisibleChange } : {}),
  });
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const barStyle = useSettingsStore((state) => state.chartBarStyle);
  const isTouch = useIsTouch();
  const isNarrow = !useMediaQuery(SM_MEDIA_QUERY);
  const textScale = useTextScale();
  const syncId = useId();
  const { update } = useDataUpdate();
  const isLoading = useContext(ChartLoadingContext);
  if (!model.hasData && !isLoading) return null;

  const body = resolveChartBody({ viewState, model, rule, isLoading });
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
      flashKeys={body === EChartBody.SPLIT ? NO_FLASH_KEYS : series.map(({ id }) => id)}
      shouldClip
      padding={ECardPadding.PANEL}
      className={CHART_CARD_CLASS}
    >
      <DataUpdateProgress />
      <ChartCardHeader
        {...shared}
        body={body}
        onHighlight={isTouch ? ignoreHighlight : setHighlightedId}
      />
      <ChartDeviceContext.Provider value={{ isTouch, isNarrow, textScale }}>
        <DataUpdateFade>
          <ChartTransition
            transitionKey={`${viewState.mode}-${body}-${update.id}`}
            isPlaceholder={isLoading}
          >
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
