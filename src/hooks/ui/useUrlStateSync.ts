import { DATASETS } from "@/constants";
import { env } from "@/libs/Env";
import { usePathname, useRouter } from "@/libs/I18nNavigation";
import { useFiltersStore } from "@/stores";
import type {
  TDatasetPeriodUrlValue,
  TParsedSharedFilterUrlState,
  TSharedFilterUrlState,
  TUseUrlStateSyncParams,
  TUseUrlStateSyncReturn,
} from "@/types";
import {
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
  const { dataset, climatePeriod, weatherYear, variables, gridSize, months } = useFiltersStore();

  const state = useMemo(() => {
    const datasetPeriod: TDatasetPeriodUrlValue =
      dataset === DATASETS.CLIMATE ? { dataset, climatePeriod } : { dataset, weatherYear };
    return mergePageAndSharedState(pageState, { datasetPeriod, variables, gridSize, months });
  }, [pageState, dataset, climatePeriod, weatherYear, variables, gridSize, months]);

  const lastWrittenRef = useRef<string | null>(null);
  const lastSeenSearchParamsRef = useRef<string | null>(null);

  useEffect(() => {
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

    if (action === "stateChange") {
      replaceUrlParams(router, pathname, next);
      lastWrittenRef.current = nextString;
    }
  }, [schema, state, searchParams, router, pathname, onRestore]);

  function pushUrlState(partial: Partial<Omit<TState, keyof TSharedFilterUrlState>>): void {
    const next = serializeUrlState(schema, { ...state, ...partial });
    lastWrittenRef.current = next.toString();
    pushUrlParams(router, pathname, next);
  }

  const shareUrl = `${env.NEXT_PUBLIC_SITE_URL}${buildLocalePathname(locale, pathname)}?${serializeUrlState(schema, state).toString()}`;

  return { pushUrlState, shareUrl };
}
