import { CHART_CONTROLS_ROW_CLASSES as C } from "@/components/ChartControlsRow/ChartControlsRow.constant";
import { VariableChips } from "@/components/TempPrecipChart/components";
import { ShadingControl } from "@/components/WalterLiethComparison/components";
import { WalterLiethGuide } from "@/components/WalterLiethGuide";
import { ECompareLayout } from "@/enums";
import { isCompleteSeries } from "@/utils";
import type { TChartControlsProps } from "./charts.type";

/**
 * The row under the header, at a fixed height: the variable chips (standard) or the guide
 * (Walter-Lieth), with the shading control over it in an overlay of a shadable pair. Series
 * chips put the variable chips beside them in the body instead.
 */
export function ChartControls({
  model,
  rule,
  viewState,
  visible,
  onVisibleChange,
}: TChartControlsProps) {
  const isWalterLieth = viewState.mode === "walter-lieth";
  const isOverlay = viewState.layout?.value === ECompareLayout.OVERLAY;
  if (!isWalterLieth && isOverlay && rule.hasSeriesChips) return null;

  const [first, second] = model.series.map(({ walterLieth }) => walterLieth);
  const shading = viewState.shading;
  const isStacked = isOverlay && rule.canShade;

  return (
    <div data-chart-controls className={isStacked ? C.STACKED : C.ROW}>
      {isWalterLieth ? (
        <>
          {isStacked &&
            shading !== undefined &&
            first !== undefined &&
            second !== undefined &&
            isCompleteSeries(first) &&
            isCompleteSeries(second) && (
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
  );
}
