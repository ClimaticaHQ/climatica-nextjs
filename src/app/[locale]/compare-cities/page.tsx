import { CompareCities } from "@/app/compare-cities/_components/CompareCities";
import { parseLocale } from "@/libs/I18nRouting";
import type { TLocalePageProps } from "@/types";
import { createLocaleMetadata, resolveCompareCitiesMeta } from "@/utils";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export const generateMetadata = createLocaleMetadata(resolveCompareCitiesMeta);

export default async function CompareCitiesPage({ params }: TLocalePageProps) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <CompareCities />
    </Suspense>
  );
}
