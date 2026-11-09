import type { TNavbarFitArgs } from "@/types";

/** The width an element's shown children take, side to side — not the box it stretches to. */
export function getContentWidth(element: Element) {
  const rects = [...element.children]
    .map((child) => child.getBoundingClientRect())
    .filter(({ width }) => width > 0);
  if (rects.length === 0) return 0;
  return Math.max(...rects.map(({ right }) => right)) - Math.min(...rects.map(({ left }) => left));
}

/**
 * Whether the navbar's links fit on one line between the logo and the controls: the row's
 * inner width against the links' own width and the other items' content.
 */
export function doesNavbarFit({ row, nav }: TNavbarFitArgs) {
  const style = getComputedStyle(row);
  const inner = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const others = [...row.children]
    .filter((child) => child !== nav)
    .reduce((sum, child) => sum + getContentWidth(child), 0);
  return nav.scrollWidth + others <= inner;
}
