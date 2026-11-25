export type TKeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type TPersistedJsonStoreArgs<T> = {
  key: string;
  defaultValue: T;
  isValue: (value: unknown) => value is T;
  getStorage?: () => TKeyValueStorage | null;
};

export type TPersistedJsonStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  /** the default, what the server rendered, so hydration matches */
  getServerSnapshot: () => T;
  set: (value: T) => void;
};

export type TCanWriteUrlStateArgs = {
  currentPathname: string;
  pagePathname: string;
  pendingPathname: string | null;
  currentSearch: string;
  scheduledSearch: string;
};

export type TLinkNavigationArgs = {
  event: Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">;
  anchor: Pick<HTMLAnchorElement, "href" | "target" | "hasAttribute">;
  location: Pick<Location, "origin" | "pathname">;
};
