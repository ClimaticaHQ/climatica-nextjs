import { FOCUSABLE_SELECTOR } from "@/constants";

/** The elements inside a container that Tab reaches, in order — not hidden, inert or disabled. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.closest("[hidden], [inert], [aria-hidden='true']") === null,
  );
}
