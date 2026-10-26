"use client";

import { useEffect } from "react";

/**
 * Stops the page scrolling while locked. The scrollbar's width goes to the body's right
 * padding, so nothing shifts when it disappears; the previous inline styles come back after.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    const { body, documentElement } = document;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const padding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${padding + scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, [isLocked]);
}
