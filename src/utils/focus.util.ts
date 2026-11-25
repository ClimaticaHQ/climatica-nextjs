import { FOCUSABLE_SELECTOR } from "@/constants";

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.closest("[hidden], [inert], [aria-hidden='true']") === null,
  );
}
