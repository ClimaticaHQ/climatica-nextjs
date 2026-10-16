import { usePopover } from "@/hooks/ui/usePopover";
import { EPopoverVariant } from "@/enums";
import {
  POPOVER_BUTTON_CLASSES,
  POPOVER_CLASSES as C,
  POPOVER_ROOT_CLASSES,
} from "./Popover.constant";
import type { TPopoverProps } from "./Popover.type";

/**
 * A button that shows a small panel below it, right-aligned. Escape or a press outside closes
 * it; Escape puts focus back on the button.
 */
export function Popover({
  trigger,
  label,
  variant = EPopoverVariant.DEFAULT,
  children,
}: TPopoverProps) {
  const { isOpen, toggle, rootRef, buttonRef, panelId } = usePopover();

  return (
    <div ref={rootRef} className={POPOVER_ROOT_CLASSES[variant]}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={variant === EPopoverVariant.ICON ? label : undefined}
        onClick={toggle}
        className={POPOVER_BUTTON_CLASSES[variant]}
      >
        {trigger}
      </button>
      <div
        id={panelId}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        hidden={!isOpen}
        className={C.PANEL}
      >
        {children}
      </div>
    </div>
  );
}
