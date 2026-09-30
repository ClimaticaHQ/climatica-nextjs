import { usePopover } from "@/hooks";
import { POPOVER_CLASSES as C } from "./Popover.constant";
import type { TPopoverProps } from "./Popover.type";

/**
 * A button that shows a small panel below it, right-aligned. Escape or a press outside closes
 * it; Escape puts focus back on the button.
 */
export function Popover({ trigger, label, children }: TPopoverProps) {
  const { isOpen, toggle, rootRef, buttonRef, panelId } = usePopover();

  return (
    <div ref={rootRef} className={C.ROOT}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
        className={C.BUTTON}
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
