import { SegmentedControl, type TSegmentedOption } from "@/components/SegmentedControl";
import { SeriesMarker } from "@/components/SeriesMarker";
import { CollapseIcon } from "@/components/svg";
import type { EWalterLiethSeriesId } from "@/enums";
import { useTranslations } from "next-intl";
import { SPLIT_PANEL_ORDER, SPLIT_PANELS_CLASSES as C } from "../SplitPanels.constant";
import type { TExpandedPanelControlsProps } from "../SplitPanels.type";
import { PanelIconButton } from "./PanelIconButton";

/** The expanded panel's header controls: which series is shown ("● A | ■ B"), and "Show both". */
export function ExpandedPanelControls({
  shown,
  labels,
  canSwitch,
  onSwitch,
  onCollapse,
  collapseRef,
  switchRef,
}: TExpandedPanelControlsProps) {
  const t = useTranslations();
  const options: TSegmentedOption<EWalterLiethSeriesId>[] = SPLIT_PANEL_ORDER.map((id) => ({
    value: id,
    label: labels[id],
    icon: <SeriesMarker id={id} />,
  }));

  return (
    <div className={C.CONTROLS}>
      {canSwitch && (
        <div ref={switchRef}>
          <SegmentedControl
            label={t("chart.expandedPanel")}
            options={options}
            value={shown}
            onChange={onSwitch}
          />
        </div>
      )}
      <PanelIconButton
        ref={collapseRef}
        label={t("chart.showBoth")}
        icon={<CollapseIcon />}
        onClick={onCollapse}
      />
    </div>
  );
}
