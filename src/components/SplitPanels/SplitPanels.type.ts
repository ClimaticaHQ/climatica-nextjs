import type { EWalterLiethSeriesId } from "@/enums";
import type { TExpandedPanel, TPanelExpansion, TPanelHeaderSlots, TSeriesShape } from "@/types";
import type { ReactNode, RefObject } from "react";

export type TSplitPanelsProps = {
  expansion: TPanelExpansion;
  labels: Record<EWalterLiethSeriesId, string>;
  shapes: Record<EWalterLiethSeriesId, TSeriesShape>;
  expandable: Record<EWalterLiethSeriesId, boolean>;
  renderPanel: (id: EWalterLiethSeriesId, panel: TSplitPanelRender) => ReactNode;
  renderLegend: (shown: TExpandedPanel) => ReactNode;
  between?: ReactNode;
};

export type TSplitPanelRender = {
  slots: TPanelHeaderSlots;
};

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
  isHiddenBelowSm?: boolean;
  ref?: RefObject<HTMLButtonElement | null> | ((element: HTMLButtonElement | null) => void);
};

export type TExpandedPanelControlsProps = {
  shown: EWalterLiethSeriesId;
  labels: Record<EWalterLiethSeriesId, string>;
  shapes: Record<EWalterLiethSeriesId, TSeriesShape>;
  canSwitch: boolean;
  onSwitch: (id: EWalterLiethSeriesId) => void;
  onCollapse: () => void;
  collapseRef: TPanelFocusRefs["collapseRef"];
  switchRef: TPanelFocusRefs["switchRef"];
};
