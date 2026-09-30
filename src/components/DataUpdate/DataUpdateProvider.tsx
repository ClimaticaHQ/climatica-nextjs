import { MOTION, NO_DATA_UPDATE } from "@/constants";
import { useDelayedFlag } from "@/hooks";
import type { TDataUpdateState } from "@/types";
import { reduceDataUpdate } from "@/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DATA_UPDATE_CLASSES as C } from "./DataUpdate.constant";
import type { TDataUpdateProviderProps } from "./DataUpdate.type";
import { DataUpdateContext } from "./DataUpdateContext";

/**
 * A page's data updates, for the cards inside: which series' data changed (by value, so the
 * first load and unchanged refetches don't count), and whether an update is loading — the
 * query's own isFetching, shown only past MOTION.UPDATE_LOADING_DELAY_MS. Announces each
 * update once in a polite live region. With motion off the loading state still shows, without
 * moving (motion.css).
 */
export function DataUpdateProvider({
  series,
  announcement,
  isFetching,
  children,
}: TDataUpdateProviderProps) {
  const [state, setState] = useState<TDataUpdateState>(() => ({
    values: series,
    update: NO_DATA_UPDATE,
    announcement: "",
  }));
  const isDelayedFetching = useDelayedFlag(isFetching, MOTION.UPDATE_LOADING_DELAY_MS);

  /** Render-phase state update — intentional: the cards see the update in this very commit */
  const next = reduceDataUpdate(state, { series, announcement });
  if (next !== state) setState(next);

  // * the cards' effects run before this one: in the update's commit they see it fresh;
  // * cards mounting later (chart type / layout) see it consumed and don't flash for it
  const consumedIdRef = useRef<number>(NO_DATA_UPDATE.id);
  useEffect(() => {
    consumedIdRef.current = state.update.id;
  }, [state.update.id]);
  const isFresh = useCallback((id: number) => id !== consumedIdRef.current, []);

  const value = useMemo(
    () => ({ update: state.update, isFresh, isLoading: isDelayedFetching }),
    [state.update, isFresh, isDelayedFetching],
  );

  return (
    <DataUpdateContext.Provider value={value}>
      {children}
      <div aria-live="polite" className={C.ANNOUNCER}>
        {state.update.id > 0 && <span key={state.update.id}>{state.announcement}</span>}
      </div>
    </DataUpdateContext.Provider>
  );
}
