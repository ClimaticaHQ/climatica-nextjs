/** One named URL value's write/read pair, composable into a page's TUrlSchema. */
export type TUrlField<TValue> = {
  serialize(value: TValue, params: URLSearchParams): void;
  parse(params: URLSearchParams): TValue | undefined;
};

export type TUrlSchema<TState> = {
  [K in keyof TState]: TUrlField<TState[K]>;
};

export type TUrlSyncAction = "external" | "ownWrite" | "stateChange";
