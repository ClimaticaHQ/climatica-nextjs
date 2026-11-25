"use client";

import { useLayoutEffect, useState } from "react";

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
