"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Whether an item of a wrapping flex row has gone to a line below its first item, kept current as
 * the row resizes. Callback refs for the row and the item; the first item is the row's first
 * element child laid out (its box, or its first child's under `display: contents`). The answer
 * comes from widths alone, so styling the item by it never changes it.
 */
export function useIsWrapped<TRow extends HTMLElement, TItem extends HTMLElement>() {
  const [row, setRow] = useState<TRow | null>(null);
  const [item, setItem] = useState<TItem | null>(null);
  const [isWrapped, setIsWrapped] = useState(false);

  // * before paint, so a wrapped item never shows its unwrapped style first
  useLayoutEffect(() => {
    if (row === null || item === null) return;
    const measure = () => {
      const first = row.firstElementChild;
      const firstBox =
        first && getComputedStyle(first).display === "contents" ? first.firstElementChild : first;
      if (!firstBox) return;
      setIsWrapped(item.getBoundingClientRect().top >= firstBox.getBoundingClientRect().bottom - 1);
    };
    // * a ResizeObserver reports once on observe — that's the first measurement
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [row, item]);

  return { rowRef: setRow, itemRef: setItem, isWrapped };
}
