import type { FILTER_VIEW_BY_ROUTE } from "@/constants";

/** A page the navbar links to. */
export type TPageRoute = keyof typeof FILTER_VIEW_BY_ROUTE;

/** Per page, its own params as last seen in its URL ("layout=overlay&periods=…"). */
export type TLastPageParams = Partial<Record<TPageRoute, string>>;

export type TLastPageParamsState = {
  pages: TLastPageParams;
  setPageParams: (route: TPageRoute, query: string) => void;
};

/** A page's remembered URL state, re-read through its own URL fields. */
export type TPageParamsNormalizers = Record<
  TPageRoute,
  (params: URLSearchParams) => URLSearchParams
>;

export type TBuildNavbarHrefArgs = {
  route: TPageRoute;
  /** the current URL's params — their shared filters win */
  current: URLSearchParams;
  /** the target page's remembered params, if any */
  remembered: string | undefined;
  /** the syncFilters setting: the current shared filters, or the target page's own */
  isSyncingFilters: boolean;
};
