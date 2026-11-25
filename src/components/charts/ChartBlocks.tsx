import { ChartLegend } from "@/components/ChartLegend";
import { MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { EChartBlock, EChartBlockPlacement, EChartBody } from "@/enums";
import { COMPARISON_METRIC_LABEL_KEYS, SERIES_KIND_RULES } from "@/constants";
import { useStatsTable } from "@/hooks/charts/useStatsTable";
import { useLegendLabels } from "@/hooks/ui/useLegendLabels";
import { useWalterLiethLegendItems } from "@/hooks/ui/useWalterLiethLegendItems";
import { getEntityBarSwatch } from "@/utils";
import { useTranslations } from "next-intl";
import { useContext } from "react";
import { ChartLoadingContext } from "./chartLoading.context";
import { PENDING_MONTHS } from "./charts.constant";
import type {
  TChartBlockDefinition,
  TChartBlockProps,
  TChartBlocksProps,
  TSectionBlockProps,
} from "./charts.type";
import { getChartLegendItems, getContextSwatchStyle, getSeriesMarker } from "./charts.util";
import { StatsTable } from "./StatsTable";

function ValuesTableBlock({ context }: TChartBlockProps) {
  const { entries, body, mode, isCompact, activeMonth } = context;
  const isOverlay = body === EChartBody.OVERLAY;
  const isStandard = mode === "standard";
  const swatchStyle = getContextSwatchStyle(context);
  const isLoading = useContext(ChartLoadingContext);

  return (
    <MonthlyValuesTable
      series={entries.map((entry) => ({
        key: entry.series.id,
        label: entry.series.label,
        data: isLoading ? PENDING_MONTHS : entry.chartData,
      }))}
      {...(isOverlay
        ? {
            markers: entries.map((entry) => ({
              ...getSeriesMarker(entry),
              ...getEntityBarSwatch(swatchStyle, entry.series.hatch, entry.series.markerSlot),
              ...(isStandard ? { title: entry.series.label } : {}),
            })),
          }
        : {})}
      isCompact={isCompact}
      activeMonthIndex={activeMonth.activeMonthIndex}
      onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
    />
  );
}

function LegendBlock({ context }: TChartBlockProps) {
  const labels = useLegendLabels();
  const walterLieth = useWalterLiethLegendItems();
  return <ChartLegend items={getChartLegendItems(context, labels, walterLieth)} />;
}

function StatsTableBlock({ model, features }: TSectionBlockProps) {
  const t = useTranslations();
  const table = useStatsTable(model, features);
  const [first] = model.series;
  if (!first) return null;

  const rule = SERIES_KIND_RULES[first.series.kind];
  const martonneLabel = rule.isSingleYear
    ? t("chart.martonnePerYear")
    : first.series.year !== null
      ? t("chart.martonneShortYear", { year: first.series.year })
      : t(COMPARISON_METRIC_LABEL_KEYS.martonne);

  return (
    <StatsTable
      table={table}
      columns={model.series.map((entry) => ({ marker: getSeriesMarker(entry) }))}
      martonneLabel={martonneLabel}
      differenceMeaning={features.difference?.meaning ?? null}
      sort={features.seriesSort}
    />
  );
}

/** a new block is added here with its EChartBlock member */
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
