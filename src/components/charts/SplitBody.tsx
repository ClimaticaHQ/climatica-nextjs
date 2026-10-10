"use client";

import { Card } from "@/components/Card";
import { SplitPanels, type TSplitPanelRender } from "@/components/SplitPanels";
import { StandardPanel } from "@/components/TempPrecipChart/components/StandardSplitView/components";
import { SwapButton } from "@/components/UI";
import { WalterLiethChart } from "@/components/WalterLiethChart";
import { WalterLiethIncompleteNotice } from "@/components/WalterLiethChart/components";
import { NO_PANEL_EXPANSION } from "@/components/TempPrecipChart/TempPrecipChart.constant";
import { SPLIT_PANEL_CARD_CLASS } from "@/constants";
import { ECardPadding, ECardSize, EWalterLiethSeriesId } from "@/enums";
import type { TChartSeriesModel } from "@/types";
import { isCompleteSeries } from "@/utils";
import { setPairSide, swapPair } from "@/utils/pair.util";
import { useTranslations } from "next-intl";
import { ChartBlocks } from "./ChartBlocks";
import { BLOCK_PLACEMENTS, SPLIT_SIDES } from "./charts.constant";
import type { TChartBodyProps } from "./charts.type";
import { getBlockContext, getSplitPair, getStandardPalette } from "./charts.util";
import { SidePicker } from "./SidePicker";

/**
 * Two series side by side, each in its panel card with its blocks; the body's blocks below
 * both. With side pickers each panel picks its series and a swap sits between them.
 */
export function SplitBody(props: TChartBodyProps) {
  const t = useTranslations();
  const { model, rule, viewState, features, visible, activeMonth, syncId } = props;
  const pair = getSplitPair(model, viewState);
  if (pair === null) return null;

  const panels = {
    [EWalterLiethSeriesId.A]: pair.entries[0],
    [EWalterLiethSeriesId.B]: pair.entries[1],
  };
  const sides = {
    [EWalterLiethSeriesId.A]: SPLIT_SIDES[0],
    [EWalterLiethSeriesId.B]: SPLIT_SIDES[1],
  };
  const isExpandable = (entry: TChartSeriesModel) =>
    viewState.expansion !== undefined &&
    (viewState.mode === "standard" || isCompleteSeries(entry.walterLieth));
  const pairState = viewState.pair;
  const hasPickers = features.hasSidePickers && pairState !== undefined;

  const renderPanel = (id: EWalterLiethSeriesId, { slots }: TSplitPanelRender) => {
    const entry = panels[id];
    const other =
      panels[id === EWalterLiethSeriesId.A ? EWalterLiethSeriesId.B : EWalterLiethSeriesId.A];
    const headerSlots = hasPickers
      ? {
          ...slots,
          name: (
            <SidePicker
              side={sides[id]}
              entries={model.series}
              rule={rule}
              value={entry.series.id}
              otherId={other.series.id}
              onChange={(next) => pairState.onChange(setPairSide(pair.ids, sides[id], next))}
            />
          ),
        }
      : slots;
    const footer = (
      <ChartBlocks
        context={getBlockContext(props, { entries: [entry], isCompact: true, shownPanel: null })}
        placements={BLOCK_PLACEMENTS.PANEL}
        hiddenBlocks={features.hiddenBlocks}
      />
    );

    if (viewState.mode === "standard") {
      return (
        <StandardPanel
          panel={{
            series: entry.walterLieth,
            chartData: entry.chartData,
            aridity: entry.aridity,
            colors: getStandardPalette(entry, rule),
          }}
          headerSlots={headerSlots}
          scales={model.scales}
          rightMax={model.rightMax}
          visible={visible}
          selectedMonths={viewState.selectedMonths ?? undefined}
          activeMonthIndex={activeMonth.activeMonthIndex}
          onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
          syncId={syncId}
          footer={footer}
        />
      );
    }
    return isCompleteSeries(entry.walterLieth) ? (
      <Card
        size={ECardSize.SM}
        padding={ECardPadding.PANEL}
        flashKeys={[entry.series.id]}
        data-panel-series={entry.series.id}
        className={SPLIT_PANEL_CARD_CLASS}
      >
        <WalterLiethChart
          series={entry.walterLieth}
          domain={model.domain}
          syncId={syncId}
          isCompact
          isPanel
          headerSlots={headerSlots}
          activeMonthIndex={activeMonth.activeMonthIndex}
          onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
          footer={footer}
        />
      </Card>
    ) : (
      <div className="sm:row-span-3">
        <WalterLiethIncompleteNotice label={entry.walterLieth.label} />
      </div>
    );
  };

  return (
    <SplitPanels
      expansion={viewState.expansion ?? NO_PANEL_EXPANSION}
      labels={{
        [EWalterLiethSeriesId.A]: pair.entries[0].series.label,
        [EWalterLiethSeriesId.B]: pair.entries[1].series.label,
      }}
      expandable={{
        [EWalterLiethSeriesId.A]: isExpandable(pair.entries[0]),
        [EWalterLiethSeriesId.B]: isExpandable(pair.entries[1]),
      }}
      renderPanel={renderPanel}
      renderLegend={(shown) => (
        <ChartBlocks
          context={getBlockContext(props, {
            entries: pair.entries,
            isCompact: false,
            shownPanel: shown,
          })}
          placements={BLOCK_PLACEMENTS.BODY}
          hiddenBlocks={features.hiddenBlocks}
        />
      )}
      {...(hasPickers
        ? {
            between: (
              <SwapButton
                label={t("comparePeriods.swapPeriods")}
                onClick={() => pairState.onChange(swapPair(pair.ids))}
              />
            ),
          }
        : {})}
    />
  );
}
