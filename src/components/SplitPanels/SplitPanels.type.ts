import type { EWalterLiethSeriesId } from "@/enums";
import type { TExpandedPanel, TPanelExpansion, TPanelHeaderSlots } from "@/types";
import type { ReactNode, RefObject } from "react";

export type TSplitPanelsProps = {
  expansion: TPanelExpansion;
  /** series names — the switch's options and the buttons' accessible names */
  labels: Record<EWalterLiethSeriesId, string>;
  /** panels with a header to expand (an incomplete WL series shows only its notice) */
  expandable: Record<EWalterLiethSeriesId, boolean>;
  /** one panel, with the header slots this container gives it */
  renderPanel: (id: EWalterLiethSeriesId, panel: TSplitPanelRender) => ReactNode;
  /** below the panels; told which panel is shown alone (null: both) */
  renderLegend: (shown: TExpandedPanel) => ReactNode;
};

/** How the container shows a panel: the header slots it gives it. */
export type TSplitPanelRender = {
  slots: TPanelHeaderSlots;
};

/** Where focus goes once the panels re-render: the collapse button, the switch, or a panel's expand button. */
export type TPanelFocusTarget = "collapse" | "switch" | EWalterLiethSeriesId;

export type TPanelFocusRefs = {
  collapseRef: RefObject<HTMLButtonElement | null>;
  switchRef: RefObject<HTMLDivElement | null>;
  expandRefs: RefObject<Partial<Record<EWalterLiethSeriesId, HTMLButtonElement | null>>>;
};

export type TPanelIconButtonProps = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  /** below `sm` the panels are already full width — the expand button is dropped there */
  isHiddenBelowSm?: boolean;
  ref?: RefObject<HTMLButtonElement | null> | ((element: HTMLButtonElement | null) => void);
};

export type TExpandedPanelControlsProps = {
  shown: EWalterLiethSeriesId;
  labels: Record<EWalterLiethSeriesId, string>;
  /** only when the other panel can be shown too */
  canSwitch: boolean;
  onSwitch: (id: EWalterLiethSeriesId) => void;
  onCollapse: () => void;
  collapseRef: TPanelFocusRefs["collapseRef"];
  switchRef: TPanelFocusRefs["switchRef"];
};
