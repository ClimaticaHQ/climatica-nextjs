import { ComparePeriods } from "@/app/compare-periods/_components/ComparePeriods";
import { parseLocale } from "@/libs/I18nRouting";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function ComparePeriodsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <ComparePeriods />
    </Suspense>
  );
}
