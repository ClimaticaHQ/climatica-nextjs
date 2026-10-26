import { env } from "@/libs/Env";
import { usePathname, useRouter } from "next/navigation";
import { useNavigationIntentStore } from "@/stores";
import type { TUseUrlStateSyncParams, TUseUrlStateSyncReturn } from "@/types";
import {
  canWriteUrlState,
  decideUrlSyncAction,
  omitFilterParams,
  parseUrlState,
  pushUrlParams,
  replaceUrlParams,
  serializeUrlState,
  withFilterParams,
} from "@/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useIsClient } from "./useIsClient";

/**
 * Syncs a page's own URL state (city, chart mode, layout…) — filters live in the URL alone
 * (useFilters / useFilterNavigation) and are only carried along, untouched, by every write.
 * Every comparison below is on the page params only, so a filter change never reads as a
 * restore.
 *
 * Restores from the URL on mount and on back/forward (an "external" change — the page params
 * moved to a string this hook didn't itself write), and pushes page state back to the URL when
 * it drifts from the last-written string (a "stateChange" — replace, never push).
 * pushUrlState() is the only path that creates history entries, for explicit user actions.
 *
 * Nothing is read or written before the first client render, when the persisted cities are in;
 * then every field the URL carries wins, the rest keep their persisted value, else the default.
 *
 * A write is scheduled, not immediate, and re-checked when it runs: it's dropped if this page
 * is no longer the browser's route, a navigation is on its way elsewhere (its replace() would
 * cancel that navigation), or the URL changed since it was scheduled (back/forward restored an
 * entry — that entry wins and is read as "external" next render); cancelled on unmount or a
 * pathname change.
 */
export function useUrlStateSync<TState extends Record<string, unknown>>({
  schema,
  state,
  onRestore,
}: TUseUrlStateSyncParams<TState>): TUseUrlStateSyncReturn<TState> {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isReady = useIsClient();

  const lastWrittenRef = useRef<string | null>(null);
  const lastSeenPageParamsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const searchParamsString = searchParams.toString();
    const pageParamsString = omitFilterParams(searchParams).toString();
    const next = serializeUrlState(schema, state);
    const nextString = next.toString();

    const action = decideUrlSyncAction({
      searchParamsChanged: pageParamsString !== lastSeenPageParamsRef.current,
      searchParamsString: pageParamsString,
      lastWritten: lastWrittenRef.current,
      nextFromState: nextString,
    });
    lastSeenPageParamsRef.current = pageParamsString;

    if (action === "external") {
      onRestore(parseUrlState(schema, searchParams));
      lastWrittenRef.current = pageParamsString;
      return;
    }

    if (action !== "stateChange") return;
    const timer = window.setTimeout(() => {
      const canWrite = canWriteUrlState({
        currentPathname: window.location.pathname,
        pagePathname: pathname,
        pendingPathname: useNavigationIntentStore.getState().pendingPathname,
        currentSearch: new URLSearchParams(window.location.search).toString(),
        scheduledSearch: searchParamsString,
      });
      if (!canWrite) return;
      lastWrittenRef.current = nextString;
      replaceUrlParams(router, pathname, withFilterParams(next, searchParams));
    });
    return () => window.clearTimeout(timer);
  }, [isReady, schema, state, searchParams, router, pathname, onRestore]);

  function pushUrlState(partial: Partial<TState>): void {
    const next = serializeUrlState(schema, { ...state, ...partial });
    lastWrittenRef.current = next.toString();
    pushUrlParams(router, pathname, withFilterParams(next, searchParams));
  }

  const shareParams = withFilterParams(serializeUrlState(schema, state), searchParams);
  const shareUrl = `${env.NEXT_PUBLIC_SITE_URL}${pathname}?${shareParams.toString()}`;

  return { pushUrlState, shareUrl };
}
