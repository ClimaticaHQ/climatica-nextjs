"use client";

import { LG_MEDIA_QUERY } from "@/constants";
import type { TTopbarMenuArgs } from "@/types";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The navbar menu's open state: closed on a new page, on a tap outside the header, and when the
 * window grows to lg while the links fit there (collapsed, the menu stays).
 */
export function useTopbarMenu({ isCollapsed }: TTopbarMenuArgs) {
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    queueMicrotask(() => setIsOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (isCollapsed) return;
    const handleResize = () => {
      if (window.matchMedia(LG_MEDIA_QUERY).matches) setIsOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = ({ target }: MouseEvent | TouchEvent) => {
      const header = headerRef.current;
      if (header && target instanceof Node && !header.contains(target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [isOpen]);

  return {
    headerRef,
    isOpen,
    toggle: () => setIsOpen((wasOpen) => !wasOpen),
    close: () => setIsOpen(false),
  };
}
