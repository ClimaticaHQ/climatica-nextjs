"use client";

import { ChartSection } from "@/components/charts";
import { ComparedPeriods, FilterBar } from "@/components/filters";
import { PageLayout } from "@/components/page";
import { useTranslations } from "next-intl";
import type { TComparePeriodsViewProps } from "./ComparePeriods.type";
import { PeriodCitySearch } from "./PeriodCitySearch";
import { PeriodTrendCards } from "./PeriodTrendCards";
import { WeatherYearsSection } from "./WeatherYearsSection";

export function ComparePeriodsView({ page }: TComparePeriodsViewProps) {
  const t = useTranslations();

  return (
    <PageLayout
      title={t("pages.comparePeriods.title")}
      description={t("pages.comparePeriods.description")}
      controls={
        <>
          <PeriodCitySearch {...page.search} />
          <FilterBar />
          <ComparedPeriods />
        </>
      }
      state={page.state}
      update={page.update}
      main={
        page.weather ? (
          <WeatherYearsSection {...page.weather} />
        ) : (
          <ChartSection chart={page} scrollRef={page.resultsRef} />
        )
      }
      details={<PeriodTrendCards trend={page.details} />}
    />
  );
}
