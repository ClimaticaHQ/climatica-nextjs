import { PANEL_CARD_ROWS_CLASS, PanelCard } from "@/components/PanelCard";
import { CHART_PLOT } from "@/constants";
import { Fragment } from "react";
import { SPLIT_PANEL_ORDER, SPLIT_PANELS_CLASSES as C } from "../SplitPanels.constant";
import type { TSplitHeaderSizerProps } from "../SplitPanels.type";

/**
 * The split's layout with its panel headers and empty plot boxes — no charts. Rendered
 * invisibly behind an expanded panel, it holds exactly the split's height.
 */
export function SplitHeaderSizer({ expandable, renderHeader }: TSplitHeaderSizerProps) {
  return (
    <div className={C.SPLIT}>
      {SPLIT_PANEL_ORDER.map((id) => (
        <Fragment key={id}>
          {/* * an incomplete WL series shows a short notice — the other panel sets the height */}
          {expandable[id] && (
            <PanelCard>
              <div className={`${C.SIZER_PANEL} ${PANEL_CARD_ROWS_CLASS}`}>
                {renderHeader(id)}
                <div className={CHART_PLOT.HEIGHT.COMPACT} />
              </div>
            </PanelCard>
          )}
        </Fragment>
      ))}
    </div>
  );
}
