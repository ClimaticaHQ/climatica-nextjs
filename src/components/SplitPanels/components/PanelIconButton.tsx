import { SPLIT_PANELS_CLASSES as C } from "../SplitPanels.constant";
import type { TPanelIconButtonProps } from "../SplitPanels.type";

/** A panel header's icon button (expand, collapse): named by aria-label, shared focus ring. */
export function PanelIconButton({
  label,
  icon,
  onClick,
  isHiddenBelowSm,
  ref,
}: TPanelIconButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`${C.ICON_BUTTON} ${isHiddenBelowSm ? C.HIDDEN_BELOW_SM : ""}`}
    >
      {icon}
    </button>
  );
}
