import type { FILTER_VIEW_BY_ROUTE } from "@/constants";

export type TPageRoute = keyof typeof FILTER_VIEW_BY_ROUTE;

export type TLastPageParams = Partial<Record<TPageRoute, string>>;

export type TLastPageParamsState = {
  pages: TLastPageParams;
  setPageParams: (route: TPageRoute, query: string) => void;
};

export type TPageParamsNormalizers = Record<
  TPageRoute,
  (params: URLSearchParams) => URLSearchParams
>;

export type TBuildNavbarHrefArgs = {
  route: TPageRoute;
  current: URLSearchParams;
  remembered: string | undefined;
  isSyncingFilters: boolean;
};
