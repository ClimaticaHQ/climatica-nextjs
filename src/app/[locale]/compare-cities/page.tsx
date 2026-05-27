import { CompareCities } from "@/app/compare-cities/_components/CompareCities";
import { parseLocale } from "@/libs/I18nRouting";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function CompareCitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <CompareCities />
    </Suspense>
  );
}
