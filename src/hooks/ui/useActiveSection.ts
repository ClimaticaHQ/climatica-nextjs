"use client";

import { SCROLL_SPY } from "@/constants";
import { getActiveSectionIndex } from "@/utils/activeSection.util";
import { useEffect, useRef, useState } from "react";

/**
 * Scroll spy: which of these sections (element ids, in page order) is current in the scrolling
 * <main> that holds them — the last whose top has crossed a line near the top; sections too near
 * the end to reach it take turns as the scroll runs out, and at the very end the last is current
 * (getActiveSectionIndex). select() marks a clicked section at once and holds it while the page
 * scrolls there, until that scroll ends or the user scrolls. On a load with a hash, the browser's
 * jump puts that section under the line.
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
    let frame = 0;

    function update() {
      const rootTop = root.getBoundingClientRect().top;
      const index = getActiveSectionIndex({
        tops: sections.map(
          (section) => section.getBoundingClientRect().top - rootTop + root.scrollTop,
        ),
        scrollTop: root.scrollTop,
        maxScroll: root.scrollHeight - root.clientHeight,
        line: margin + ((root.clientHeight - margin) * SCROLL_SPY.LINE_PERCENT) / 100,
        endTolerance: SCROLL_SPY.END_TOLERANCE_PX,
      });
      const next = sections[index]?.id;
      if (next !== undefined) setActiveId(next);
    }

    function handleScroll() {
      if (lockedRef.current) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    // * a clicked section's own scroll has ended: it stays current until the user scrolls on
    function handleScrollEnd() {
      if (lockedRef.current) lockedRef.current = false;
      else update();
    }

    // * the user takes over a scroll to a clicked section
    function handleUserScroll() {
      lockedRef.current = false;
    }

    update();
    root.addEventListener("scroll", handleScroll, { passive: true });
    root.addEventListener("scrollend", handleScrollEnd);
    window.addEventListener("resize", handleScroll);
    for (const type of SCROLL_SPY.USER_SCROLL_EVENTS)
      root.addEventListener(type, handleUserScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("scroll", handleScroll);
      root.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("resize", handleScroll);
      for (const type of SCROLL_SPY.USER_SCROLL_EVENTS)
        root.removeEventListener(type, handleUserScroll);
    };
  }, [key]);

  function select(id: string) {
    lockedRef.current = true;
    setActiveId(id);
  }

  // * before the first update (and after a page switch), the first section
  const current = activeId !== null && ids.includes(activeId) ? activeId : (ids[0] ?? null);
  return { activeId: current, select };
}
