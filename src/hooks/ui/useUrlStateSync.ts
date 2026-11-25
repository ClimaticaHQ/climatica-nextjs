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
