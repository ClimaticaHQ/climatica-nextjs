import type { TLocale } from "@/constants";

export type TSearchParams = Record<string, string | string[] | undefined>;

export type TLocalePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<TSearchParams>;
};

export type TResolveMetaArgs = {
  locale: TLocale;
  searchParams: TSearchParams;
};

export type TResolveOgMetaArgs = TResolveMetaArgs & {
  route: string | undefined;
};

export type TRouteMeta = {
  title: string;
  description: string;
  imagePath: string;
};

export type TMetaResolver = (args: TResolveMetaArgs) => Promise<TRouteMeta>;

export type TFormatPeriodLabelParams = {
  dataset: string | undefined;
  period: string | undefined;
  year: string | undefined;
};

export type TFormatPeriodsComparisonParams = {
  dataset: string | undefined;
  periodA: string | undefined;
  periodB: string | undefined;
  periods: string | undefined;
};

export type TCommonClimateParams = {
  dataset: string | undefined;
  varParam: string | undefined;
  periodParam: string | undefined;
  yearParam: string | undefined;
  variables: string;
  period: string;
};
