import { ESlidingIndicatorAxis } from "@/enums";
import type { TIndicatorRect, TIndicatorRectArgs, TIndicatorStyleArgs } from "@/types";
import type { CSSProperties } from "react";

/**
 * An item's box in its container's padding box (where an absolute child starts), from their
 * rendered boxes: sub-pixel exact, scrolled content included, and unscaled when an ancestor is
 * scaled for a moment (a panel expanding).
 */
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

export function isSameIndicatorRect(a: TIndicatorRect, b: TIndicatorRect) {
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height;
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

/** The indicator's inline style: its place by transform, its size by width / height. */
export function getIndicatorStyle({ rect, axis }: TIndicatorStyleArgs) {
  return STYLE_BY_AXIS[axis](rect);
}
