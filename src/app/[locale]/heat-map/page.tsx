import { HeatMap } from "@/app/heat-map/_components/HeatMap";
import { parseLocale } from "@/libs/I18nRouting";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export default async function HeatMapPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <HeatMap />
    </Suspense>
  );
}
