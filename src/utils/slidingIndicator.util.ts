import { ESlidingIndicatorAxis } from "@/enums";
import { COLLAPSIBLE_OPEN_ATTRIBUTE, COLLAPSIBLE_SELECTOR } from "@/constants";
import type {
  TIndicatorRect,
  TIndicatorRectArgs,
  TIndicatorStyleArgs,
  TIndicatorTargetArgs,
} from "@/types";
import type { CSSProperties } from "react";

export function getIndicatorRect({ container, item }: TIndicatorRectArgs): TIndicatorRect {
  const box = container.getBoundingClientRect();
  const target = item.getBoundingClientRect();
  // * offsetWidth is rounded to a whole px: within that, the container isn't scaled
  const isScaled = Math.abs(box.width - container.offsetWidth) >= 1 && container.offsetWidth > 0;
  const scale = isScaled ? box.width / container.offsetWidth : 1;
  return {
    left: (target.left - box.left) / scale - container.clientLeft + container.scrollLeft,
    top: (target.top - box.top) / scale - container.clientTop + container.scrollTop,
    width: target.width / scale,
    height: target.height / scale,
  };
}

// * px — float noise in a projected place (getFoldedRect), never a move
const SAME_RECT_TOLERANCE_PX = 0.01;

export function isSameIndicatorRect(a: TIndicatorRect, b: TIndicatorRect) {
  const sides = [a.left - b.left, a.top - b.top, a.width - b.width, a.height - b.height];
  return sides.every((side) => Math.abs(side) < SAME_RECT_TOLERANCE_PX);
}

function getFoldedHeight(collapsible: Element) {
  const isOpen = collapsible.getAttribute(COLLAPSIBLE_OPEN_ATTRIBUTE) === "true";
  return isOpen ? (collapsible.firstElementChild?.scrollHeight ?? 0) : 0;
}

export function getFoldedRect({ rect, container, item }: TIndicatorTargetArgs): TIndicatorRect {
  const shift = [...container.querySelectorAll(COLLAPSIBLE_SELECTOR)]
    .filter(
      (collapsible) =>
        !collapsible.contains(item) &&
        Boolean(collapsible.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING),
    )
    .reduce(
      (sum, collapsible) =>
        sum + getFoldedHeight(collapsible) - collapsible.getBoundingClientRect().height,
      0,
    );
  return { ...rect, top: rect.top + shift };
}

const STYLE_BY_AXIS: Record<ESlidingIndicatorAxis, (rect: TIndicatorRect) => CSSProperties> = {
  [ESlidingIndicatorAxis.BOTH]: ({ left, top, width, height }) => ({
    width,
    height,
    transform: `translate(${left}px, ${top}px)`,
  }),
  [ESlidingIndicatorAxis.VERTICAL]: ({ top, height }) => ({
    height,
    transform: `translateY(${top}px)`,
  }),
};

export function getIndicatorStyle({ rect, axis }: TIndicatorStyleArgs) {
  return STYLE_BY_AXIS[axis](rect);
}
