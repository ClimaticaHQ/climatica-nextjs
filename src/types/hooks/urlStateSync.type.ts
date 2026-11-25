import type { TUrlSchema } from "../utils/urlParams.type";

export type TUseUrlStateSyncParams<TState extends Record<string, unknown>> = {
  schema: TUrlSchema<TState>;
  state: NoInfer<TState>;
  onRestore: (parsed: Partial<NoInfer<TState>>) => void;
};

export type TUseUrlStateSyncReturn<TState extends Record<string, unknown>> = {
  pushUrlState: (partial: Partial<TState>) => void;
  shareUrl: string;
};
