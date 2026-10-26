"use client";

import { ChartSection } from "@/components/charts";
import { FilterBar } from "@/components/filters";
import { PageLayout } from "@/components/page";
import { useTranslations } from "next-intl";
import { CityDifferenceCards } from "./CityDifferenceCards";
import { CityPairSearch } from "./CityPairSearch";
import type { TCompareCitiesViewProps } from "./CompareCities.type";

export function CompareCitiesView({ page }: TCompareCitiesViewProps) {
  const t = useTranslations();

  return (
    <PageLayout
      title={t("pages.compareCities.title")}
      description={t("pages.compareCities.description")}
      controls={
        <>
          <CityPairSearch {...page.search} />
          <FilterBar />
        </>
      }
      state={page.state}
      update={page.update}
      main={<ChartSection chart={page} scrollRef={page.resultsRef} />}
      details={<CityDifferenceCards differences={page.details} />}
    />
  );
}
