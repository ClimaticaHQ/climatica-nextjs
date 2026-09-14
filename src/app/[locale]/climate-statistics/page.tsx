import { ClimateStatistics } from "@/app/climate-statistics/_components/ClimateStatistics";
import { parseLocale } from "@/libs/I18nRouting";
import type { TLocalePageProps } from "@/types";
import { createLocaleMetadata, resolveClimateStatisticsMeta } from "@/utils";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export const generateMetadata = createLocaleMetadata(resolveClimateStatisticsMeta);

export default async function ClimateStatisticsPage({ params }: TLocalePageProps) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <ClimateStatistics />
    </Suspense>
  );
}
