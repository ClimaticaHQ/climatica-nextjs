import { WalterLiethGuide } from "@/components/WalterLiethChart";
import { ECompareLayout } from "@/enums";
import { getSwatchBarStyle, isCompleteSeries } from "@/utils";
import { CHART_CARD_HEADER_CLASSES as C } from "./charts.constant";
import type { TChartCardHeaderProps } from "./charts.type";
import { getTitleNames } from "./charts.util";
import { ChartSwitches } from "./ChartSwitches";
import { ChartToolbar } from "./ChartToolbar";
import { ChartTitle } from "./ChartTitle";
import { SeriesChips } from "./SeriesChips";
import { ShadingControl } from "./ShadingControl";
import { VariableChips } from "./VariableChips";

/**
 * The card's top: the title block with the chart type and layout switches (beside it, or under
 * it when the card is narrow — a container query), then the toolbar, the same row in every view:
 * the series chips (an overlay of a kind with them) on the left, the view's controls on the
 * right — the variable chips (standard) or the guide (Walter-Lieth), the shading control over it
 * in an overlay of a shadable pair.
 */
export function ChartCardHeader({
  model,
  rule,
  viewState,
  features,
  body,
  barStyle,
  visible,
  onVisibleChange,
  onHighlight,
}: TChartCardHeaderProps) {
  const { mode, layout, shading, shown } = viewState;
  const isWalterLieth = mode === "walter-lieth";
  const isOverlay = layout?.value === ECompareLayout.OVERLAY;
  const hasChips = isOverlay && rule.hasSeriesChips && shown !== undefined;
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
      <ChartToolbar
        isStacked={isStacked}
        {...(hasChips
          ? {
              chips: (
                <SeriesChips
                  entries={model.series}
                  barStyle={getSwatchBarStyle({
                    mode,
                    body,
                    barStyle,
                    isPrecVisible: visible.prec,
                  })}
                  shown={shown.value}
                  onShownChange={shown.onChange}
                  onHighlight={onHighlight}
                />
              ),
            }
          : {})}
        controls={
          isWalterLieth ? (
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
          )
        }
      />
    </>
  );
}
