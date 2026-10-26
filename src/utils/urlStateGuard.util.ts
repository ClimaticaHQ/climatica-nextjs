import type { TCanWriteUrlStateArgs, TLinkNavigationArgs } from "@/types";

/**
 * Whether a page may rewrite its URL now: only while it is still the browser's current route,
 * no navigation is on its way elsewhere (a replace() then would cancel it), and the URL is still
 * the one the write was based on — after back/forward the restored entry wins.
 */
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

/** A plain left click — not one opening a new tab or window (modifier keys, other buttons). */
export function isPlainLinkClick(event: TLinkNavigationArgs["event"]) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * The browser path a click on this anchor navigates to inside the app, or null when it doesn't
 * leave the current route (another origin, new tab, download, same path, modified click).
 */
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
