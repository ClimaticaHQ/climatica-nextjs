import type { EDataStatus } from "@/enums";

/**
 * Where a page's (or a series') data stands. An error carries the error itself, never its
 * text: what a reader sees is the translated message for its cause (getErrorMessageKey).
 */
export type TDataState =
  | { status: EDataStatus.LOADING }
  | { status: EDataStatus.READY }
  /** message null: an empty result the page shows nothing for */
  | { status: EDataStatus.EMPTY; message: string | null }
  | { status: EDataStatus.ERROR; error: unknown };

export type TResolveDataStateArgs = {
  isLoading: boolean;
  error: unknown;
  hasData: boolean;
  /** what an empty result says — e.g. the no-period-data message */
  emptyMessage: string | null;
};
