import { ChartTransition } from "@/components/ChartTransition";
import { ExpandIcon } from "@/components/svg";
import { EWalterLiethSeriesId } from "@/enums";
import { getShownPanel } from "@/utils";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import {
  ExpandedPanelControls,
  ExpandedPanelFrame,
  PanelIconButton,
  SplitHeaderSizer,
} from "./components";
import { usePanelFocus, usePanelOrigin } from "./hooks";
import {
  SPLIT_PANEL_ORDER,
  SPLIT_PANELS_CLASSES as C,
  SPLIT_TRANSITION_KEY,
} from "./SplitPanels.constant";
import type { TPanelFocusTarget, TSplitPanelsProps } from "./SplitPanels.type";

/**
 * The split comparison's panels, for either chart type: both side by side, or one expanded
 * across the card (its plot as tall as in the split, on the same shared domains). Each header
 * gets an expand button; the expanded one a series switch and "Show both".
 */
export function SplitPanels({
  expansion,
  labels,
  expandable,
  referenceLabel,
  renderPanel,
  renderHeader,
  renderLegend,
}: TSplitPanelsProps) {
  const t = useTranslations();
  const shown = getShownPanel(expansion.expanded, expandable);
  const origin = usePanelOrigin(shown);
  const { collapseRef, switchRef, expandRefs, requestFocus } = usePanelFocus(shown);
  const other = SPLIT_PANEL_ORDER.find((id) => id !== shown);

  const show = (id: EWalterLiethSeriesId | null, focus: TPanelFocusTarget) => {
    requestFocus(focus);
    expansion.onExpandedChange(id);
  };

  const expandButton = (id: EWalterLiethSeriesId) => (
    <PanelIconButton
      ref={(element) => {
        expandRefs.current[id] = element;
      }}
      label={t("chart.expandPanel", { name: labels[id] })}
      icon={<ExpandIcon />}
      onClick={() => show(id, "collapse")}
      isHiddenBelowSm
    />
  );

  return (
    <div>
      <ChartTransition transitionKey={shown ?? SPLIT_TRANSITION_KEY} enterOrigin={origin}>
        {shown ? (
          <ExpandedPanelFrame
            sizer={<SplitHeaderSizer expandable={expandable} renderHeader={renderHeader} />}
          >
            {renderPanel(shown, {
              isExpanded: true,
              slots: {
                actions: (
                  <ExpandedPanelControls
                    shown={shown}
                    labels={labels}
                    canSwitch={other !== undefined && expandable[other]}
                    onSwitch={(id) => show(id, "switch")}
                    onCollapse={() => show(null, shown)}
                    collapseRef={collapseRef}
                    switchRef={switchRef}
                  />
                ),
                // * A is hidden: B's deltas say what they're measured against
                subtitleNote:
                  shown === EWalterLiethSeriesId.B && referenceLabel !== null
                    ? t("chart.differencesVs", { name: referenceLabel })
                    : undefined,
              },
            })}
          </ExpandedPanelFrame>
        ) : (
          <div className={C.SPLIT}>
            {SPLIT_PANEL_ORDER.map((id) => (
              <Fragment key={id}>
                {renderPanel(id, {
                  isExpanded: false,
                  slots: expandable[id] ? { actions: expandButton(id) } : {},
                })}
              </Fragment>
            ))}
          </div>
        )}
      </ChartTransition>
      {renderLegend(shown)}
    </div>
  );
}
