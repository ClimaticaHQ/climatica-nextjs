import { useEffect, useId, useRef, useState } from "react";

const CLOSE_KEY = "Escape";

/**
 * A disclosure popover's state: toggled by its button, closed by Escape or a press outside it
 * — focus goes back to the button, unless the press itself focused something else.
 */
export function usePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && rootRef.current?.contains(e.target)) return;
      setIsOpen(false);
      // * after the press has moved focus: nothing focusable was pressed → back to the button
      requestAnimationFrame(() => {
        if (document.activeElement === document.body) buttonRef.current?.focus();
      });
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== CLOSE_KEY) return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return { isOpen, toggle: () => setIsOpen((open) => !open), rootRef, buttonRef, panelId };
}
