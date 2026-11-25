import type { TScrollEdges, TScrollOptions } from "@/types";
import { getScrollBehavior } from "./motion.util";

const SCROLL_OFFSET_PX = 54;

export function scrollToSection(el: HTMLElement, options: TScrollOptions = {}) {
  const container = el.closest("main") as HTMLElement | null;
  const { offset = SCROLL_OFFSET_PX, toBottom = false } = options;

  if (!container) {
    const targetY = toBottom
      ? document.documentElement.scrollHeight
      : el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: targetY, behavior: getScrollBehavior() });
    return;
  }

  if (toBottom) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: getScrollBehavior(),
    });
    return;
  }

  const top =
    el.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop -
    offset;

  container.scrollTo({ top: Math.max(0, top), behavior: getScrollBehavior() });
}

// * px of slack, so subpixel scroll positions don't count as hidden content
const SCROLL_EDGE_TOLERANCE_PX = 1;

export function getScrollEdges(element: HTMLElement): TScrollEdges {
  const { scrollLeft, clientWidth, scrollWidth } = element;
  return {
    isStartHidden: scrollLeft > SCROLL_EDGE_TOLERANCE_PX,
    isEndHidden: scrollLeft + clientWidth < scrollWidth - SCROLL_EDGE_TOLERANCE_PX,
  };
}

export function areScrollEdgesEqual(a: TScrollEdges, b: TScrollEdges) {
  return a.isStartHidden === b.isStartHidden && a.isEndHidden === b.isEndHidden;
}

export function scrollToSectionAfterSheetClose(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
}
