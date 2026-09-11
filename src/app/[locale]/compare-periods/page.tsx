import { ComparePeriods } from "@/app/compare-periods/_components/ComparePeriods";
import { parseLocale } from "@/libs/I18nRouting";
import type { TLocalePageProps } from "@/types";
import { createLocaleMetadata, resolveComparePeriodsMeta } from "@/utils";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export const generateMetadata = createLocaleMetadata(resolveComparePeriodsMeta);

export default async function ComparePeriodsPage({ params }: TLocalePageProps) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <ComparePeriods />
    </Suspense>
  );
}
