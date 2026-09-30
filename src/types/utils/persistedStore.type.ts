/** The subset of Web Storage a persisted store needs — localStorage, or a test double. */
export type TKeyValueStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type TPersistedJsonStoreArgs<T> = {
  key: string;
  defaultValue: T;
  /** narrows the parsed JSON; a stored value that fails it reads as the default */
  isValue: (value: unknown) => value is T;
  /** where values live; localStorage in the browser, none on the server */
  getStorage?: () => TKeyValueStorage | null;
};

/**
 * One persisted value shared by every component that reads it (useSyncExternalStore): all
 * readers see the same value, and it's in place from the first client render on.
 */
export type TPersistedJsonStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  /** the default — what the server rendered, so hydration matches */
  getServerSnapshot: () => T;
  set: (value: T) => void;
};

export type TCanWriteUrlStateArgs = {
  /** the browser's current path (window.location.pathname) */
  currentPathname: string;
  /** the path of the page that owns this URL state, locale prefix included */
  pagePathname: string;
  /** where an in-flight link navigation is going; null when none */
  pendingPathname: string | null;
  /** the browser's current query string, normalized (no leading "?") */
  currentSearch: string;
  /** the query string the write was scheduled against */
  scheduledSearch: string;
};

export type TLinkNavigationArgs = {
  event: Pick<MouseEvent, "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">;
  anchor: Pick<HTMLAnchorElement, "href" | "target" | "hasAttribute">;
  location: Pick<Location, "origin" | "pathname">;
};
