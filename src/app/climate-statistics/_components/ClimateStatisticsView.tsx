"use client";

import { ChartSection } from "@/components/charts";
import { FilterBar } from "@/components/filters";
import { LocationSearch } from "@/components/LocationSearch";
import { PageLayout } from "@/components/page";
import { MapSkeleton } from "@/components/UI";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { CityStatCards } from "./CityStatCards";
import type { TClimateStatisticsViewProps } from "./ClimateStatistics.type";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((m) => ({ default: m.LeafletMap })),
  { ssr: false, loading: () => <MapSkeleton variant="full" /> },
);

export function ClimateStatisticsView({ page }: TClimateStatisticsViewProps) {
  const t = useTranslations();

  return (
    <PageLayout
      title={t("pages.climateStatistics.title")}
      description={t("pages.climateStatistics.description")}
      controls={
        <>
          <LocationSearch {...page.search} />
          <FilterBar />
        </>
      }
      map={
        <section>
          <LeafletMap {...page.map} />
        </section>
      }
      state={page.state}
      update={page.update}
      resultsRef={page.resultsRef}
      summary={<CityStatCards state={page.state} summary={page.summary} />}
      main={<ChartSection chart={page} />}
    />
  );
}
