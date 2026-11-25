import type { EDataStatus } from "@/enums";

/** an error carries the error itself, never its text: readers see the translated message for its cause */
export type TDataState =
  | { status: EDataStatus.LOADING }
  | { status: EDataStatus.READY }
  | { status: EDataStatus.EMPTY; messages: readonly string[] }
  | { status: EDataStatus.ERROR; error: unknown };

export type TResolveDataStateArgs = {
  isLoading: boolean;
  error: unknown;
  hasData: boolean;
  emptyMessages: readonly string[];
};
