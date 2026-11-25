"use client";

import { doesNavbarFit } from "@/utils/navbarFit.util";
import { useLayoutEffect, useRef, useState } from "react";

export function useNavbarFit() {
  const rowRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const nav = navRef.current;
    if (row === null || nav === null) return;
    const observer = new ResizeObserver(() => setIsCollapsed(!doesNavbarFit({ row, nav })));
    observer.observe(row);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  return { rowRef, navRef, isCollapsed };
}
