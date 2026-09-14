import {
  CLIMATE_PERIOD_LABELS,
  DATASETS,
  OG_IMAGE_SIZE,
  ROUTES,
  SIDEBAR_PARAMS,
  VARIABLE_LABELS,
} from "@/constants";
import { parseLocale } from "@/libs/I18nRouting";
import type {
  TCommonClimateParams,
  TFormatPeriodLabelParams,
  TFormatPeriodsComparisonParams,
  TLocalePageProps,
  TMetaResolver,
  TResolveMetaArgs,
  TResolveOgMetaArgs,
  TRouteMeta,
  TSearchParams,
} from "@/types";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export function getSearchParam(searchParams: TSearchParams, key: string): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

// Building a fully-typed object from a runtime-iterated key map requires a
// cast at the boundary — TS can't otherwise prove the loop covers every K.
export function extractParams<K extends string>(
  searchParams: TSearchParams,
  keys: Record<K, string>,
): Record<K, string | undefined> {
  const entries = (Object.keys(keys) as K[]).map((key): [K, string | undefined] => [
    key,
    getSearchParam(searchParams, keys[key]),
  ]);
  return Object.fromEntries(entries) as Record<K, string | undefined>;
}

function isVariableLabelKey(value: string): value is keyof typeof VARIABLE_LABELS {
  return value in VARIABLE_LABELS;
}

function isClimatePeriodKey(value: string): value is keyof typeof CLIMATE_PERIOD_LABELS {
  return value in CLIMATE_PERIOD_LABELS;
}

export function formatVariablesLabel(varsParam: string | undefined): string {
  if (!varsParam) return "";
  return varsParam
    .split(",")
    .map((v) => (isVariableLabelKey(v) ? VARIABLE_LABELS[v] : v))
    .join(", ");
}

export function formatPeriodLabel({ dataset, period, year }: TFormatPeriodLabelParams): string {
  if (dataset === DATASETS.WEATHER) return year ?? "";
  if (!period) return "";
  return isClimatePeriodKey(period) ? CLIMATE_PERIOD_LABELS[period] : period;
}

export function formatPeriodsComparisonLabel({
  dataset,
  periodA,
  periodB,
  periods,
}: TFormatPeriodsComparisonParams): string {
  if (dataset === DATASETS.WEATHER && periods) {
    return periods.split(",").filter(Boolean).join(" vs ");
  }
  if (periodA && periodB) {
    const labelA = isClimatePeriodKey(periodA) ? CLIMATE_PERIOD_LABELS[periodA] : periodA;
    const labelB = isClimatePeriodKey(periodB) ? CLIMATE_PERIOD_LABELS[periodB] : periodB;
    return `${labelA} vs ${labelB}`;
  }
  return "";
}

export function buildOgImagePath(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  return `/api/og?${query.toString()}`;
}

// Shared by resolvers that filter on dataset + variables + a single
// period/year (climateStatistics, compareCities, heatMap). comparePeriods
// compares two periods instead, so it has its own extraction below.
function resolveCommonClimateParams(searchParams: TSearchParams): TCommonClimateParams {
  const { dataset, varParam, periodParam, yearParam } = extractParams(searchParams, {
    dataset: SIDEBAR_PARAMS.DATASET,
    varParam: SIDEBAR_PARAMS.VAR,
    periodParam: SIDEBAR_PARAMS.PERIOD,
    yearParam: SIDEBAR_PARAMS.YEAR,
  });

  return {
    dataset,
    varParam,
    periodParam,
    yearParam,
    variables: formatVariablesLabel(varParam),
    period: formatPeriodLabel({ dataset, period: periodParam, year: yearParam }),
  };
}

export async function resolveClimateStatisticsMeta({
  locale,
  searchParams,
}: TResolveMetaArgs): Promise<TRouteMeta> {
  const [t, tPage] = await Promise.all([
    getTranslations({ locale, namespace: "meta.climateStatistics" }),
    getTranslations({ locale, namespace: "climateStatistics" }),
  ]);

  const { city } = extractParams(searchParams, { city: SIDEBAR_PARAMS.CITY });
  const { dataset, varParam, periodParam, yearParam, variables, period } =
    resolveCommonClimateParams(searchParams);

  const title = city ? t("title", { city }) : tPage("title");
  const description =
    city && variables && period ? t("description", { city, variables, period }) : tPage("subtitle");

  const imagePath = buildOgImagePath({
    route: ROUTES.CLIMATE_STATISTICS,
    locale,
    city,
    dataset,
    var: varParam,
    period: periodParam,
    year: yearParam,
  });

  return { title, description, imagePath };
}

export async function resolveCompareCitiesMeta({
  locale,
  searchParams,
}: TResolveMetaArgs): Promise<TRouteMeta> {
  const [t, tPage] = await Promise.all([
    getTranslations({ locale, namespace: "meta.compareCities" }),
    getTranslations({ locale, namespace: "compareCities" }),
  ]);

  const { cityA, cityB } = extractParams(searchParams, {
    cityA: SIDEBAR_PARAMS.COMPARE_CITY_A,
    cityB: SIDEBAR_PARAMS.COMPARE_CITY_B,
  });
  const { dataset, varParam, periodParam, yearParam, variables, period } =
    resolveCommonClimateParams(searchParams);

  const title = cityA && cityB ? t("title", { cityA, cityB }) : tPage("title");
  const description =
    cityA && cityB && variables && period
      ? t("description", { cityA, cityB, variables, period })
      : tPage("selectSecondCity");

  const imagePath = buildOgImagePath({
    route: ROUTES.COMPARE_CITIES,
    locale,
    cityA,
    cityB,
    dataset,
    var: varParam,
    period: periodParam,
    year: yearParam,
  });

  return { title, description, imagePath };
}

export async function resolveComparePeriodsMeta({
  locale,
  searchParams,
}: TResolveMetaArgs): Promise<TRouteMeta> {
  const [t, tPage] = await Promise.all([
    getTranslations({ locale, namespace: "meta.comparePeriods" }),
    getTranslations({ locale, namespace: "comparePeriods" }),
  ]);

  const { city, dataset, varParam, periodAParam, periodBParam, periodsParam } = extractParams(
    searchParams,
    {
      city: SIDEBAR_PARAMS.CITY,
      dataset: SIDEBAR_PARAMS.DATASET,
      varParam: SIDEBAR_PARAMS.VAR,
      periodAParam: SIDEBAR_PARAMS.PERIOD_A,
      periodBParam: SIDEBAR_PARAMS.PERIOD_B,
      periodsParam: SIDEBAR_PARAMS.PERIODS,
    },
  );
  const variables = formatVariablesLabel(varParam);
  const periods = formatPeriodsComparisonLabel({
    dataset,
    periodA: periodAParam,
    periodB: periodBParam,
    periods: periodsParam,
  });

  const title = city ? t("title", { city }) : tPage("title");
  const description =
    city && variables && periods
      ? t("description", { city, variables, periods })
      : t("descriptionGeneric");

  const imagePath = buildOgImagePath({
    route: ROUTES.COMPARE_PERIODS,
    locale,
    city,
    dataset,
    var: varParam,
    periodA: periodAParam,
    periodB: periodBParam,
    periods: periodsParam,
  });

  return { title, description, imagePath };
}

export async function resolveHeatMapMeta({
  locale,
  searchParams,
}: TResolveMetaArgs): Promise<TRouteMeta> {
  const [t, tPage] = await Promise.all([
    getTranslations({ locale, namespace: "meta.heatMap" }),
    getTranslations({ locale, namespace: "heatMap" }),
  ]);

  const { polygon, north, south, west, east } = extractParams(searchParams, {
    polygon: SIDEBAR_PARAMS.POLYGON,
    north: SIDEBAR_PARAMS.BBOX_NORTH,
    south: SIDEBAR_PARAMS.BBOX_SOUTH,
    west: SIDEBAR_PARAMS.BBOX_WEST,
    east: SIDEBAR_PARAMS.BBOX_EAST,
  });
  const hasBbox = [north, south, west, east].every((value) => value !== undefined);
  const hasSelection = hasBbox || Boolean(polygon);

  const { dataset, varParam, periodParam, yearParam, variables, period } =
    resolveCommonClimateParams(searchParams);

  const title = hasSelection && variables ? t("title", { variables, period }) : tPage("title");
  const description =
    hasSelection && variables && period
      ? t("description", { variables, period })
      : tPage("noSelection");

  const imagePath = buildOgImagePath({
    route: ROUTES.HEAT_MAP,
    locale,
    dataset,
    var: varParam,
    period: periodParam,
    year: yearParam,
    selection: hasSelection ? "1" : undefined,
  });

  return { title, description, imagePath };
}

const OG_META_RESOLVERS: Record<string, TMetaResolver> = {
  [ROUTES.CLIMATE_STATISTICS]: resolveClimateStatisticsMeta,
  [ROUTES.COMPARE_CITIES]: resolveCompareCitiesMeta,
  [ROUTES.COMPARE_PERIODS]: resolveComparePeriodsMeta,
  [ROUTES.HEAT_MAP]: resolveHeatMapMeta,
};

export async function resolveOgMeta({
  route,
  locale,
  searchParams,
}: TResolveOgMetaArgs): Promise<TRouteMeta> {
  const resolver = (route ? OG_META_RESOLVERS[route] : undefined) ?? resolveClimateStatisticsMeta;
  return resolver({ locale, searchParams });
}

export function createLocaleMetadata(resolver: TMetaResolver) {
  return async function generateMetadata({
    params,
    searchParams,
  }: TLocalePageProps): Promise<Metadata> {
    const locale = parseLocale((await params).locale);
    const { title, description, imagePath } = await resolver({
      locale,
      searchParams: await searchParams,
    });

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: imagePath, width: OG_IMAGE_SIZE.width, height: OG_IMAGE_SIZE.height }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imagePath],
      },
    };
  };
}
