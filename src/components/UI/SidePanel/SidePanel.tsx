import { SIDE_PANEL_CLASSES as C } from "./SidePanel.constant";
import type { TSidePanelProps } from "./SidePanel.type";

/** The app's left panel from lg: the filters' column, the Info pages' navigation. */
export function SidePanel({ label, children, footer }: TSidePanelProps) {
  return (
    <aside className={C.ROOT} aria-label={label}>
      <div className={C.BODY}>{children}</div>
      {footer !== undefined && <div className={C.FOOTER}>{footer}</div>}
    </aside>
  );
}
