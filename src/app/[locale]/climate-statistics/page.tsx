import { ClimateStatistics } from "@/app/climate-statistics/_components/ClimateStatistics";
import { parseLocale } from "@/libs/I18nRouting";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function ClimateStatisticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <ClimateStatistics />
    </Suspense>
  );
}
