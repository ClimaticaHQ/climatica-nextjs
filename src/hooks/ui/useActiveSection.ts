"use client";

import { SCROLL_SPY } from "@/constants";
import { useEffect, useRef, useState } from "react";

/**
 * Scroll spy: which of these sections (element ids, in page order) is in view in the scrolling
 * <main> that holds them. The band starts at the sections' scroll margin, where an anchor jump
 * puts them; at the very end of the page the last section is current, short as it may be.
 * select() highlights a clicked section at once and holds it while the page scrolls there. On
 * a load with a hash, the browser's jump puts that section in the band.
 */
export function useActiveSection(ids: readonly string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const lockedRef = useRef(false);
  const key = ids.join(" ");

  useEffect(() => {
    const order = key === "" ? [] : key.split(" ");
    const sections = order.flatMap((id) => document.getElementById(id) ?? []);
    const main = sections[0]?.closest("main");
    if (!sections[0] || !main) return;
    const root: HTMLElement = main;

    const margin = parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
    const inBand = new Set<string>();

    function update() {
      if (lockedRef.current) return;
      const isAtEnd =
        root.scrollTop + root.clientHeight >= root.scrollHeight - SCROLL_SPY.END_TOLERANCE_PX;
      const next = isAtEnd ? order[order.length - 1] : order.find((id) => inBand.has(id));
      // * between two sections (their gap in the band) the last one stays current
      if (next !== undefined) setActiveId(next);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) inBand.add(target.id);
          else inBand.delete(target.id);
        }
        update();
      },
      {
        root,
        rootMargin: `-${margin}px 0px -${SCROLL_SPY.BAND_BOTTOM_PERCENT}% 0px`,
      },
    );
    sections.forEach((section) => observer.observe(section));

    // * the end of the page doesn't move any section across the band: check it on scroll's end
    const handleScrollEnd = () => {
      lockedRef.current = false;
      update();
    };
    root.addEventListener("scrollend", handleScrollEnd);
    return () => {
      observer.disconnect();
      root.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [key]);

  useEffect(() => {
    if (!lockedRef.current) return;
    const timer = setTimeout(() => (lockedRef.current = false), SCROLL_SPY.LOCK_MS);
    return () => clearTimeout(timer);
  }, [activeId]);

  function select(id: string) {
    lockedRef.current = true;
    setActiveId(id);
  }

  // * before the observer reports (and after a page switch), the first section
  const current = activeId !== null && ids.includes(activeId) ? activeId : (ids[0] ?? null);
  return { activeId: current, select };
}
