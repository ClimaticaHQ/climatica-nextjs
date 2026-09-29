import type { EWalterLiethSeriesId } from "@/enums";
import type { TExpandedPanel, TPanelExpansion, TPanelHeaderSlots } from "@/types";
import type { ReactNode, RefObject } from "react";

export type TSplitPanelsProps = {
  expansion: TPanelExpansion;
  /** series names — the switch's options and the buttons' accessible names */
  labels: Record<EWalterLiethSeriesId, string>;
  /** panels with a header to expand (an incomplete WL series shows only its notice) */
  expandable: Record<EWalterLiethSeriesId, boolean>;
  /** A's name when B shows its differences from A — B's note once A is hidden */
  referenceLabel: string | null;
  /** one panel, with the header slots this container gives it */
  renderPanel: (id: EWalterLiethSeriesId, panel: TSplitPanelRender) => ReactNode;
  /** a panel's header alone (name, period, stats) — held invisibly to keep the split's height */
  renderHeader: (id: EWalterLiethSeriesId) => ReactNode;
  /** below the panels; told which panel is shown alone (null: both) */
  renderLegend: (shown: TExpandedPanel) => ReactNode;
};

/** How the container shows a panel: its header slots, and whether it fills the card. */
export type TSplitPanelRender = {
  slots: TPanelHeaderSlots;
  /** expanded: the plot fills the height the split's headers leave */
  isExpanded: boolean;
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

export type TExpandedPanelFrameProps = {
  /** the split's panel headers as they would render — invisible, they only hold its height */
  sizer: ReactNode;
  children: ReactNode;
};

export type TSplitHeaderSizerProps = {
  expandable: Record<EWalterLiethSeriesId, boolean>;
  renderHeader: (id: EWalterLiethSeriesId) => ReactNode;
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
