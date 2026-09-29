import { SPLIT_PANELS_CLASSES as C } from "../SplitPanels.constant";
import type { TExpandedPanelFrameProps } from "../SplitPanels.type";

/**
 * The expanded panel, as tall as the split it replaces: an invisible, inert copy of the split
 * shares its grid cell (from `sm`), and the panel stretches to it with its plot at the bottom.
 */
export function ExpandedPanelFrame({ sizer, children }: TExpandedPanelFrameProps) {
  return (
    <div className={C.EXPANDED_STACK}>
      <div aria-hidden inert className={`${C.STACK_LAYER} ${C.SIZER}`}>
        {sizer}
      </div>
      <div className={`${C.STACK_LAYER} ${C.EXPANDED}`}>{children}</div>
    </div>
  );
}
