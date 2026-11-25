import type { TNavbarFitArgs } from "@/types";

export function getContentWidth(element: Element) {
  const rects = [...element.children]
    .map((child) => child.getBoundingClientRect())
    .filter(({ width }) => width > 0);
  if (rects.length === 0) return 0;
  return Math.max(...rects.map(({ right }) => right)) - Math.min(...rects.map(({ left }) => left));
}

export function doesNavbarFit({ row, nav }: TNavbarFitArgs) {
  const style = getComputedStyle(row);
  const inner = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const others = [...row.children]
    .filter((child) => child !== nav)
    .reduce((sum, child) => sum + getContentWidth(child), 0);
  return nav.scrollWidth + others <= inner;
}
