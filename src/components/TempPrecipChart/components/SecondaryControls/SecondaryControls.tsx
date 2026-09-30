import { ChartControlsRow, ShadingControl } from "@/components";
import { WalterLiethGuide } from "@/components/WalterLiethGuide";
import { isCompleteSeries } from "@/utils";
import type { TSecondaryControlsProps } from "../../TempPrecipChart.type";
import { VariableChips } from "../VariableChips";

/**
 * The controls row's content for the chart shown: the variable chips (standard), or the
 * "how to read" guide (WL) — below the shading control in overlay.
 */
export function SecondaryControls({
  isWalterLieth,
  isOverlay,
  comparison: { seriesA, seriesB },
  shading,
  onShadingChange,
  visible,
  variables,
  onVisibleChange,
}: TSecondaryControlsProps) {
  const canShade = isOverlay && isCompleteSeries(seriesA) && isCompleteSeries(seriesB);

  return (
    <ChartControlsRow isStacked={isOverlay}>
      {isWalterLieth ? (
        <>
          {canShade && (
            <ShadingControl
              seriesA={seriesA}
              seriesB={seriesB}
              shading={shading}
              onChange={onShadingChange}
            />
          )}
          <WalterLiethGuide />
        </>
      ) : (
        <VariableChips visible={visible} variables={variables} onChange={onVisibleChange} />
      )}
    </ChartControlsRow>
  );
}
