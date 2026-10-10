import { EChartBlock, EChartBlockPlacement } from "@/enums";
import type { TChartBlockDefinition, TChartBlocksProps } from "./charts.type";
import { LegendBlock } from "./LegendBlock";
import { ValuesTableBlock } from "./ValuesTableBlock";

/**
 * Everything drawn under or around a chart, in order. A new block is added here (with its
 * EChartBlock member) and appears under every chart of every page; a page leaves one out
 * through its features' hiddenBlocks.
 */
const CHART_BLOCKS = {
  [EChartBlock.VALUES_TABLE]: {
    placement: EChartBlockPlacement.PANEL,
    Component: ValuesTableBlock,
  },
  [EChartBlock.LEGEND]: { placement: EChartBlockPlacement.BODY, Component: LegendBlock },
} satisfies Record<EChartBlock, TChartBlockDefinition>;

/**
 * The blocks for one spot: under a panel, under the body, or both (a body of one panel). Every
 * body places this; none renders a block itself. A display: contents frame keeps each block
 * a direct child of the chart's layout.
 */
export function ChartBlocks({ context, placements, hiddenBlocks }: TChartBlocksProps) {
  return Object.values(EChartBlock)
    .filter(
      (block) =>
        placements.includes(CHART_BLOCKS[block].placement) && !hiddenBlocks.includes(block),
    )
    .map((block) => {
      const { Component } = CHART_BLOCKS[block];
      return (
        <div key={block} data-chart-block={block} className="contents">
          <Component context={context} />
        </div>
      );
    });
}
