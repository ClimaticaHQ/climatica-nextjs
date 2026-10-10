import { ChartTransition } from "@/components/ChartTransition";
import { useDataUpdate } from "@/components/DataUpdate";
import { EChartBody } from "@/enums";
import type { ComponentType } from "react";
import type { TChartBodyProps } from "./charts.type";
import { OverlayBody } from "./OverlayBody";
import { SingleBody } from "./SingleBody";
import { SplitBody } from "./SplitBody";

const CHART_BODIES = {
  [EChartBody.SINGLE]: SingleBody,
  [EChartBody.SPLIT]: SplitBody,
  [EChartBody.OVERLAY]: OverlayBody,
} satisfies Record<EChartBody, ComponentType<TChartBodyProps>>;

/** The card's body for its layout — crossfading when the chart type, layout or data changes. */
export function ChartBody(props: TChartBodyProps) {
  const { update } = useDataUpdate();
  const Body = CHART_BODIES[props.body];

  return (
    <ChartTransition transitionKey={`${props.viewState.mode}-${props.body}-${update.id}`}>
      <Body {...props} />
    </ChartTransition>
  );
}
