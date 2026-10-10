"use client";

import { Card } from "@/components/Card";
import { DataUpdateFade, DataUpdateProgress } from "@/components/DataUpdate";
import { useVisibleSeries } from "@/components/TempPrecipChart/hooks/useVisibleSeries";
import { NO_FLASH_KEYS } from "@/constants";
import { EChartBody } from "@/enums";
import { useId, useState } from "react";
import { ChartBody } from "./ChartBody";
import { ChartCardHeader } from "./ChartCardHeader";
import { ChartControls } from "./ChartControls";
import { CHART_CARD_CLASS } from "./charts.constant";
import type { TChartCardProps } from "./charts.type";
import { getSeriesKindRule, getTitleNames, resolveChartBody } from "./charts.util";

/**
 * The chart card, the same for every page: header, controls and the body for the layout, all
 * derived from the series, the view state and the page's features.
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
  if (!model.hasData) return null;

  const body = resolveChartBody({ viewState, model, rule });
  const shared = { model, rule, body, viewState, visible, onVisibleChange: setVisible };

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
      <ChartCardHeader
        names={getTitleNames(model, rule, features)}
        subtitle={features.title.subtitle}
        mode={viewState.mode}
        selectedMonths={viewState.selectedMonths}
        hasMonthBadge={features.hasMonthBadge}
        viewState={viewState}
      />
      <ChartControls {...shared} />
      <DataUpdateFade>
        <ChartBody
          {...shared}
          features={features}
          activeMonth={{ activeMonthIndex, onActiveMonthIndexChange: setActiveMonthIndex }}
          syncId={syncId}
        />
      </DataUpdateFade>
    </Card>
  );
}
