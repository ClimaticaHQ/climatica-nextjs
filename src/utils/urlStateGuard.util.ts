import type { TCanWriteUrlStateArgs, TLinkNavigationArgs } from "@/types";

export function canWriteUrlState({
  currentPathname,
  pagePathname,
  pendingPathname,
  currentSearch,
  scheduledSearch,
}: TCanWriteUrlStateArgs): boolean {
  const isCurrentRoute = currentPathname === pagePathname;
  const isLeaving = pendingPathname !== null && pendingPathname !== pagePathname;
  const isUrlUnchanged = currentSearch === scheduledSearch;
  return isCurrentRoute && !isLeaving && isUrlUnchanged;
}

export function isPlainLinkClick(event: TLinkNavigationArgs["event"]) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function getLinkNavigationTarget({
  event,
  anchor,
  location,
}: TLinkNavigationArgs): string | null {
  const opensHere =
    (anchor.target === "" || anchor.target === "_self") && !anchor.hasAttribute("download");
  if (!isPlainLinkClick(event) || !opensHere) return null;
  const url = new URL(anchor.href, location.origin);
  return url.origin === location.origin && url.pathname !== location.pathname ? url.pathname : null;
}
