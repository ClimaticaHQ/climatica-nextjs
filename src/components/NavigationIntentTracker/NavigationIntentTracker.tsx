"use client";

import { NAVIGATION_INTENT_TIMEOUT_MS } from "@/constants";
import { useNavigationIntentStore } from "@/stores";
import { getLinkNavigationTarget } from "@/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Records where an internal link click is navigating (capture phase, before the router acts)
 * and clears it once the route changes — so useUrlStateSync never rewrites the old page's URL
 * while the navigation is in flight. Renders nothing.
 */
export function NavigationIntentTracker() {
  // * the browser path, locale prefix included — so a locale switch counts as landing too
  const pathname = usePathname();
  const pendingPathname = useNavigationIntentStore((state) => state.pendingPathname);
  const setPendingPathname = useNavigationIntentStore((state) => state.setPendingPathname);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const target = getLinkNavigationTarget({ event, anchor, location: window.location });
      if (target !== null) setPendingPathname(target);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [setPendingPathname]);

  // * the primary clear: the navigation landed (or back/forward moved elsewhere)
  useEffect(() => {
    setPendingPathname(null);
  }, [pathname, setPendingPathname]);

  // * fallback only: a navigation that never lands (aborted, failed) stops blocking URL writes
  useEffect(() => {
    if (pendingPathname === null) return;
    const timer = setTimeout(() => setPendingPathname(null), NAVIGATION_INTENT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [pendingPathname, setPendingPathname]);

  return null;
}
