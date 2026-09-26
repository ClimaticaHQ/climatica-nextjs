import type { TCellSize, TMonthFilter, TVariable } from "../domain";
import type {
  TDatasetPeriodUrlValue,
  TSharedFilterUrlState,
  TUrlSchema,
} from "../utils/urlParams.type";

export type TUseUrlStateSyncParams<TState extends TSharedFilterUrlState & Record<string, unknown>> =
  {
    schema: TUrlSchema<TState>;
    state: Omit<TState, keyof TSharedFilterUrlState>;
    onRestore: (parsed: Partial<TState>) => void;
  };

export type TUseUrlStateSyncReturn<TState extends TSharedFilterUrlState & Record<string, unknown>> =
  {
    pushUrlState: (partial: Partial<Omit<TState, keyof TSharedFilterUrlState>>) => void;
    shareUrl: string;
  };

/** Explicit `| undefined` — matches Partial<TState>'s field types under exactOptionalPropertyTypes. */
export type TParsedSharedFilterUrlState = {
  datasetPeriod?: TDatasetPeriodUrlValue | undefined;
  variables?: TVariable[] | undefined;
  gridSize?: TCellSize | undefined;
  months?: TMonthFilter | undefined;
};
