import { DATASETS } from "@/constants";
import { env } from "@/libs/Env";
import { usePathname, useRouter } from "@/libs/I18nNavigation";
import { useFiltersStore, useNavigationIntentStore } from "@/stores";
import type {
  TDatasetPeriodUrlValue,
  TParsedSharedFilterUrlState,
  TSharedFilterUrlState,
  TUseUrlStateSyncParams,
  TUseUrlStateSyncReturn,
} from "@/types";
import {
  canWriteUrlState,
  decideUrlSyncAction,
  parseUrlState,
  pushUrlParams,
  replaceUrlParams,
  serializeUrlState,
} from "@/utils";
import { buildLocalePathname } from "@/utils/export/shared/shareUrl.util";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useIsClient } from "./useIsClient";

/** TState's own generic bound can't prove this merge is exhaustive — the param types do. */
function mergePageAndSharedState<TState extends TSharedFilterUrlState & Record<string, unknown>>(
  pageState: Omit<TState, keyof TSharedFilterUrlState>,
  shared: Required<TSharedFilterUrlState>,
): TState {
  const merged: Record<string, unknown> = { ...pageState, ...shared };
  return merged as TState;
}

function applySharedFilterUrlState(shared: TParsedSharedFilterUrlState): void {
  const { actions } = useFiltersStore.getState();

  if (shared.datasetPeriod) {
    actions.setDataset(shared.datasetPeriod.dataset);
    if (shared.datasetPeriod.dataset === DATASETS.CLIMATE) {
      actions.setClimatePeriod(shared.datasetPeriod.climatePeriod);
    } else {
      actions.setWeatherYear(shared.datasetPeriod.weatherYear);
    }
  }
  if (shared.variables) actions.setVariables(shared.variables);
  if (shared.gridSize) actions.setGridSize(shared.gridSize);
  if (shared.months) actions.setMonths(shared.months);
}

/**
 * Restores from the URL on mount and on back/forward (an "external" change —
 * searchParams moved to a string this hook didn't itself write), and pushes
 * page state back to the URL when it drifts from the last-written string
 * (a "stateChange" — replace, never push). pushUrlState() is the only path
 * that creates history entries, for explicit user actions.
 *
 * Initial state is settled here, in one place: nothing is read or written until the persisted
 * stores are in (client render + filters store rehydrated); then every field the URL carries
 * wins, the rest keep their persisted value, else the default.
 *
 * A write is scheduled, not immediate, and re-checked when it runs: it's dropped if this page
 * is no longer the browser's route, a navigation is on its way elsewhere (its replace() would
 * cancel that navigation), or the URL changed since it was scheduled (back/forward restored an
 * entry — that entry wins and is read as "external" next render); cancelled on unmount or a
 * pathname change.
 */
export function useUrlStateSync<TState extends TSharedFilterUrlState & Record<string, unknown>>({
  schema,
  state: pageState,
  onRestore,
}: TUseUrlStateSyncParams<TState>): TUseUrlStateSyncReturn<TState> {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { dataset, climatePeriod, weatherYear, variables, gridSize, months, hasHydrated } =
    useFiltersStore();
  const isClient = useIsClient();
  const isReady = isClient && hasHydrated;

  const state = useMemo(() => {
    const datasetPeriod: TDatasetPeriodUrlValue =
      dataset === DATASETS.CLIMATE ? { dataset, climatePeriod } : { dataset, weatherYear };
    return mergePageAndSharedState(pageState, { datasetPeriod, variables, gridSize, months });
  }, [pageState, dataset, climatePeriod, weatherYear, variables, gridSize, months]);

  const lastWrittenRef = useRef<string | null>(null);
  const lastSeenSearchParamsRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    const searchParamsString = searchParams.toString();
    const next = serializeUrlState(schema, state);
    const nextString = next.toString();

    const action = decideUrlSyncAction({
      searchParamsChanged: searchParamsString !== lastSeenSearchParamsRef.current,
      searchParamsString,
      lastWritten: lastWrittenRef.current,
      nextFromState: nextString,
    });
    lastSeenSearchParamsRef.current = searchParamsString;

    if (action === "external") {
      const parsed = parseUrlState(schema, searchParams);
      applySharedFilterUrlState(parsed);
      onRestore(parsed);
      lastWrittenRef.current = searchParamsString;
      return;
    }

    if (action !== "stateChange") return;
    const pagePathname = buildLocalePathname(locale, pathname);
    const timer = window.setTimeout(() => {
      const canWrite = canWriteUrlState({
        currentPathname: window.location.pathname,
        pagePathname,
        pendingPathname: useNavigationIntentStore.getState().pendingPathname,
        currentSearch: new URLSearchParams(window.location.search).toString(),
        scheduledSearch: searchParamsString,
      });
      if (!canWrite) return;
      lastWrittenRef.current = nextString;
      replaceUrlParams(router, pathname, next);
    });
    return () => window.clearTimeout(timer);
  }, [isReady, schema, state, searchParams, router, pathname, locale, onRestore]);

  function pushUrlState(partial: Partial<Omit<TState, keyof TSharedFilterUrlState>>): void {
    const next = serializeUrlState(schema, { ...state, ...partial });
    lastWrittenRef.current = next.toString();
    pushUrlParams(router, pathname, next);
  }

  const shareUrl = `${env.NEXT_PUBLIC_SITE_URL}${buildLocalePathname(locale, pathname)}?${serializeUrlState(schema, state).toString()}`;

  return { pushUrlState, shareUrl };
}
