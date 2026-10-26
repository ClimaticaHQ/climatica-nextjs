import { FILTER_VIEW_BY_ROUTE } from "@/constants";
import type { TLastPageParams, TLastPageParamsState, TPageRoute } from "@/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Whether a pathname (no locale) is a page the navbar links to. */
export function toPageRoute(pathname: string): TPageRoute | null {
  return (
    Object.keys(FILTER_VIEW_BY_ROUTE).find((route): route is TPageRoute => route === pathname) ??
    null
  );
}

/**
 * The persisted pages, keeping only known pages with a string value — a stale or hand-edited
 * entry never reaches the store (the values themselves are re-validated when read).
 */
export function mergePersistedPageParams(
  persisted: unknown,
  current: TLastPageParamsState,
): TLastPageParamsState {
  const pages = isRecord(persisted) ? persisted["pages"] : undefined;
  if (!isRecord(pages)) return current;
  const valid: TLastPageParams = {};
  Object.entries(pages).forEach(([pathname, value]) => {
    const route = toPageRoute(pathname);
    if (route !== null && typeof value === "string") valid[route] = value;
  });
  return { ...current, pages: valid };
}
