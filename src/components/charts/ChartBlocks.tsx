import { ChartLegend } from "@/components/ChartLegend";
import { MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { EChartBlock, EChartBlockPlacement, EChartBody } from "@/enums";
import { COMPARISON_METRIC_LABEL_KEYS, SERIES_KIND_RULES } from "@/constants";
import { useStatsTable } from "@/hooks/charts/useStatsTable";
import { useLegendLabels } from "@/hooks/ui/useLegendLabels";
import { useWalterLiethLegendItems } from "@/hooks/ui/useWalterLiethLegendItems";
import { getSeriesTextColor } from "@/utils";
import { useTranslations } from "next-intl";
import type {
  TChartBlockDefinition,
  TChartBlockProps,
  TChartBlocksProps,
  TSectionBlockProps,
} from "./charts.type";
import { getChartLegendItems, getIdentityColor, getSeriesMarker } from "./charts.util";
import { StatsTable } from "./StatsTable";

/**
 * The monthly mean temperature and precipitation: one row per series, in the text colour — an
 * overlay's series show by their markers.
 */
function ValuesTableBlock({ context }: TChartBlockProps) {
  const { entries, body, rule, isCompact, activeMonth } = context;
  const isOverlay = body === EChartBody.OVERLAY;

  return (
    <MonthlyValuesTable
      series={entries.map((entry) => ({
        key: entry.series.id,
        label: entry.series.label,
        color: getSeriesTextColor({ color: getIdentityColor(entry, rule), isLargeText: false }),
        data: entry.chartData,
      }))}
      {...(isOverlay ? { markers: entries.map((entry) => getSeriesMarker(entry, rule)) } : {})}
      isCompact={isCompact}
      activeMonthIndex={activeMonth.activeMonthIndex}
      onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
    />
  );
}

/** The legend, for the chart type and body. */
function LegendBlock({ context }: TChartBlockProps) {
  const labels = useLegendLabels();
  const walterLieth = useWalterLiethLegendItems();
  return <ChartLegend items={getChartLegendItems(context, labels, walterLieth)} />;
}

/** Each series' stats, metric by metric (a pair's with their difference) — above the card. */
function StatsTableBlock({ model, features }: TSectionBlockProps) {
  const t = useTranslations();
  const table = useStatsTable(model, features);
  const [first] = model.series;
  if (!first) return null;

  const rule = SERIES_KIND_RULES[first.series.kind];
  // * a weather year's index describes that year; a pair of one weather year names it
  const martonneLabel = rule.isSingleYear
    ? t("chart.martonnePerYear")
    : first.series.year !== null
      ? t("chart.martonneShortYear", { year: first.series.year })
      : t(COMPARISON_METRIC_LABEL_KEYS.martonne);

  return (
    <StatsTable
      table={table}
      columns={model.series.map((entry) => ({
        color: getSeriesTextColor({ color: getIdentityColor(entry, rule), isLargeText: false }),
        marker: getSeriesMarker(entry, rule),
      }))}
      martonneLabel={martonneLabel}
      differenceMeaning={features.difference?.meaning ?? null}
    />
  );
}

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
  [EChartBlock.STATS_TABLE]: {
    placement: EChartBlockPlacement.SECTION,
    Component: StatsTableBlock,
  },
} satisfies Record<EChartBlock, TChartBlockDefinition>;

const BLOCK_FRAME_CLASS = "contents";

/**
 * The blocks for one spot: under a panel, under the body, or both (a body of one panel). Every
 * body places this; none renders a block itself. A display: contents frame keeps each block
 * a direct child of the chart's layout.
 */
export function ChartBlocks({ context, placements, hiddenBlocks }: TChartBlocksProps) {
  return Object.values(EChartBlock).map((block) => {
    const definition = CHART_BLOCKS[block];
    if (definition.placement === EChartBlockPlacement.SECTION) return null;
    if (!placements.includes(definition.placement) || hiddenBlocks.includes(block)) return null;
    const { Component } = definition;
    return (
      <div key={block} data-chart-block={block} className={BLOCK_FRAME_CLASS}>
        <Component context={context} />
      </div>
    );
  });
}

/** The blocks above the chart card, in the chart section. */
export function SectionBlocks({ model, features }: TSectionBlockProps) {
  return Object.values(EChartBlock).map((block) => {
    const definition = CHART_BLOCKS[block];
    if (definition.placement !== EChartBlockPlacement.SECTION) return null;
    if (features.hiddenBlocks.includes(block)) return null;
    const { Component } = definition;
    return (
      <div key={block} data-chart-block={block} className={BLOCK_FRAME_CLASS}>
        <Component model={model} features={features} />
      </div>
    );
  });
}
