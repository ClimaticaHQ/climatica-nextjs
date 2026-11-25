import { COLLAPSIBLE_ATTRIBUTE, COLLAPSIBLE_OPEN_ATTRIBUTE } from "@/constants";
import { COLLAPSIBLE_CLASS } from "./Collapsible.constant";
import type { TCollapsibleProps } from "./Collapsible.type";

/** rendered either way, in the server's HTML too, and inert while shut */
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
