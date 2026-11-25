"use client";

import { SCROLL_SPY } from "@/constants";
import { getActiveSectionIndex } from "@/utils/activeSection.util";
import { useEffect, useRef, useState } from "react";

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

    function handleScrollEnd() {
      if (lockedRef.current) lockedRef.current = false;
      else update();
    }

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

  const current = activeId !== null && ids.includes(activeId) ? activeId : (ids[0] ?? null);
  return { activeId: current, select };
}
