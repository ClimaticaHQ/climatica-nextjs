import { HeatMap } from "@/app/heat-map/_components/HeatMap";
import { parseLocale } from "@/libs/I18nRouting";
import type { TLocalePageProps } from "@/types";
import { createLocaleMetadata, resolveHeatMapMeta } from "@/utils";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

export const generateMetadata = createLocaleMetadata(resolveHeatMapMeta);

export default async function HeatMapPage({ params }: TLocalePageProps) {
  const locale = parseLocale((await params).locale);
  setRequestLocale(locale);
  return (
    <Suspense>
      <HeatMap />
    </Suspense>
  );
}
