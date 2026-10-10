"use client";

import { Card } from "@/components/Card";
import { ChartTransition } from "@/components/ChartTransition";
import { DataUpdateFade, DataUpdateProgress, useDataUpdate } from "@/components/DataUpdate";
import { useVisibleSeries } from "@/components/TempPrecipChart/hooks/useVisibleSeries";
import { NO_FLASH_KEYS } from "@/constants";
import { EChartBody } from "@/enums";
import { useId, useState, type ComponentType } from "react";
import { ChartCardHeader } from "./ChartCardHeader";
import { CHART_CARD_CLASS } from "./charts.constant";
import type { TChartBodyProps, TChartCardProps } from "./charts.type";
import { getSeriesKindRule, resolveChartBody } from "./charts.util";
import { OverlayBody } from "./OverlayBody";
import { SingleBody } from "./SingleBody";
import { SplitBody } from "./SplitBody";

const CHART_BODIES = {
  [EChartBody.SINGLE]: SingleBody,
  [EChartBody.SPLIT]: SplitBody,
  [EChartBody.OVERLAY]: OverlayBody,
} satisfies Record<EChartBody, ComponentType<TChartBodyProps>>;

/**
 * The chart card, the same for every page: its header and the body for the layout — crossfading
 * when the chart type, the layout or the data changes — all derived from the model, the view
 * state and the page's features.
 */
export function ChartCard({ model, viewState, features, onVisibleChange }: TChartCardProps) {
  const series = model.series.map(({ series: entry }) => entry);
  const rule = getSeriesKindRule(series);
  const { visible, setVisible } = useVisibleSeries({
    variables: viewState.variables,
    ...(onVisibleChange ? { onVisibleSeriesChange: onVisibleChange } : {}),
  });
  const [activeMonthIndex, setActiveMonthIndex] = useState<number | null>(null);
  const syncId = useId();
  const { update } = useDataUpdate();
  if (!model.hasData) return null;

  const body = resolveChartBody({ viewState, model, rule });
  const Body = CHART_BODIES[body];
  const shared = { model, rule, viewState, features, visible, onVisibleChange: setVisible };

  return (
    <Card
      // * split panels flash on their own; elsewhere the card flashes for any of its series
      flashKeys={body === EChartBody.SPLIT ? NO_FLASH_KEYS : series.map(({ id }) => id)}
      shouldClip
      // * several series below `sm`: panel cards or the overlay fill it, so the card goes flat
      isFlatBelowSm={body !== EChartBody.SINGLE}
      className={CHART_CARD_CLASS}
    >
      <DataUpdateProgress />
      <ChartCardHeader {...shared} />
      <DataUpdateFade>
        <ChartTransition transitionKey={`${viewState.mode}-${body}-${update.id}`}>
          <Body
            {...shared}
            body={body}
            activeMonth={{ activeMonthIndex, onActiveMonthIndexChange: setActiveMonthIndex }}
            syncId={syncId}
          />
        </ChartTransition>
      </DataUpdateFade>
    </Card>
  );
}
