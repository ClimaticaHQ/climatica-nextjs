import { EDataStatus } from "@/enums";
import type { TDataState, TResolveDataStateArgs } from "@/types";

/** A page's or a series' data state: loading first, then an error, then empty, else ready. */
export function resolveDataState({
  isLoading,
  error,
  hasData,
  emptyMessage,
}: TResolveDataStateArgs): TDataState {
  if (isLoading) return { status: EDataStatus.LOADING };
  if (error) return { status: EDataStatus.ERROR, error };
  if (!hasData) return { status: EDataStatus.EMPTY, message: emptyMessage };
  return { status: EDataStatus.READY };
}
