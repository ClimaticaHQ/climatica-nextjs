import { TScrollOptions } from "@/types";

const SCROLL_OFFSET_PX = 54;

export function scrollToSection(el: HTMLElement, options: TScrollOptions = {}) {
  const container = el.closest("main") as HTMLElement | null;
  const { offset = SCROLL_OFFSET_PX, toBottom = false } = options;

  if (!container) {
    // * if no scrollable container found, scroll the whole page
    const targetY = toBottom
      ? document.documentElement.scrollHeight
      : el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: targetY, behavior: "smooth" });
    return;
  }

  if (toBottom) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
    return;
  }

  /**
   * calculate the top position of the element
   * relative to the container, then scroll
   */
  const top =
    el.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop -
    offset;

  container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}
