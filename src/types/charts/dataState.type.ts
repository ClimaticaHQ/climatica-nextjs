import type { EDataStatus } from "@/enums";

/**
 * Where a page's (or a series') data stands. An error carries the error itself, never its
 * text: what a reader sees is the translated message for its cause (getErrorMessageKey).
 */
export type TDataState =
  | { status: EDataStatus.LOADING }
  | { status: EDataStatus.READY }
  /** what the page says about it, one line each (none: it shows nothing) */
  | { status: EDataStatus.EMPTY; messages: readonly string[] }
  | { status: EDataStatus.ERROR; error: unknown };

export type TResolveDataStateArgs = {
  isLoading: boolean;
  error: unknown;
  hasData: boolean;
  /** what an empty result says — e.g. the no-period-data message, per missing period */
  emptyMessages: readonly string[];
};
