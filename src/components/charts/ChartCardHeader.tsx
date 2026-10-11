import { ChartSwitches } from "./ChartSwitches";
import { ChartTitle } from "./ChartTitle";
import { VariableChips } from "./VariableChips";
import { ShadingControl } from "./ShadingControl";
import { WalterLiethGuide } from "@/components/WalterLiethGuide";
import { ECompareLayout } from "@/enums";
import { isCompleteSeries } from "@/utils";
import {
  CHART_CARD_HEADER_CLASSES as C,
  CHART_CONTROLS_ROW_CLASSES as ROW,
} from "./charts.constant";
import type { TChartCardHeaderProps } from "./charts.type";
import { getTitleNames } from "./charts.util";

/**
 * The card's top: the title block with the chart type and layout switches (beside it, or under
 * it when the card is narrow — a container query), then the controls row at a fixed height:
 * variable chips (standard) or the guide (Walter-Lieth), the shading control over it in an
 * overlay of a shadable pair. Series chips put the variable chips in the body instead.
 */
export function ChartCardHeader({
  model,
  rule,
  viewState,
  features,
  visible,
  onVisibleChange,
}: TChartCardHeaderProps) {
  const { mode, layout, shading } = viewState;
  const isWalterLieth = mode === "walter-lieth";
  const isOverlay = layout?.value === ECompareLayout.OVERLAY;
  const hasControlsRow = isWalterLieth || !isOverlay || !rule.hasSeriesChips;
  const isStacked = isOverlay && rule.canShade;
  const [first, second] = model.series.map(({ walterLieth }) => walterLieth);
  const canShade =
    isStacked &&
    shading !== undefined &&
    first !== undefined &&
    second !== undefined &&
    isCompleteSeries(first) &&
    isCompleteSeries(second);

  return (
    <>
      <div className={C.CONTAINER}>
        <div className={C.ROW}>
          <div className={C.TITLE}>
            <ChartTitle
              names={getTitleNames(model, rule, features)}
              subtitleText={features.title.subtitle}
              selectedMonths={viewState.selectedMonths ?? undefined}
              showMonthBadge={!isWalterLieth && features.hasMonthBadge}
            />
          </div>
          <div className={C.CONTROLS}>
            <ChartSwitches
              chartMode={mode}
              layout={layout?.value}
              onLayoutChange={(next) => layout?.onChange(next)}
            />
          </div>
        </div>
      </div>
      {hasControlsRow && (
        <div data-chart-controls className={isStacked ? ROW.STACKED : ROW.ROW}>
          {isWalterLieth ? (
            <>
              {canShade && (
                <ShadingControl
                  seriesA={first}
                  seriesB={second}
                  shading={shading.value}
                  onChange={shading.onChange}
                />
              )}
              <WalterLiethGuide />
            </>
          ) : (
            <VariableChips
              visible={visible}
              variables={viewState.variables}
              onChange={onVisibleChange}
            />
          )}
        </div>
      )}
    </>
  );
}
