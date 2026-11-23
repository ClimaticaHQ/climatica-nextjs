import { COLLAPSIBLE_ATTRIBUTE, COLLAPSIBLE_OPEN_ATTRIBUTE } from "@/constants";
import { COLLAPSIBLE_CLASS } from "./Collapsible.constant";
import type { TCollapsibleProps } from "./Collapsible.type";

/**
 * Content that folds open and shut (the `accordion` rows in animations.css): rendered either way,
 * in the server's HTML too, and inert while shut — out of the tab order and the accessibility
 * tree. Positioned, so it paints over an indicator sliding behind it.
 */
export function Collapsible({ isOpen, children }: TCollapsibleProps) {
  return (
    <div
      className={COLLAPSIBLE_CLASS}
      inert={!isOpen}
      {...{ [COLLAPSIBLE_ATTRIBUTE]: "", [COLLAPSIBLE_OPEN_ATTRIBUTE]: String(isOpen) }}
    >
      <div>{children}</div>
    </div>
  );
}
