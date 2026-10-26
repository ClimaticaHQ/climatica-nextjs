"use client";

import { FilterBar } from "@/components/filters";
import { LocationSearch } from "@/components/LocationSearch";
import { PageLayout } from "@/components/page";
import { MapSkeleton } from "@/components/UI";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { THeatMapViewProps } from "./HeatMap.type";
import { RegionalClimateProfile } from "./components/RegionalClimateProfile";
import { StatsLegendBar } from "./components/StatsLegendBar";
import { Toolbar } from "./components/Toolbar";

const MapCanvas = dynamic(
  () => import("./components/MapCanvas").then((m) => ({ default: m.MapCanvas })),
  {
    ssr: false,
    loading: () => <MapSkeleton variant="full" heightClassName="h-[70vh] sm:h-[520px]" />,
  },
);

export function HeatMapView({ page }: THeatMapViewProps) {
  const t = useTranslations();

  return (
    <PageLayout
      title={t("pages.heatMap.title")}
      description={t("pages.heatMap.description")}
      controls={
        <>
          <LocationSearch {...page.search} />
          <FilterBar />
          <Toolbar {...page.toolbar} />
        </>
      }
      state={page.state}
      update={page.update}
      summary={page.hasSelection && <StatsLegendBar {...page.stats} />}
      main={<MapCanvas {...page.map} />}
      details={page.hasSelection && <RegionalClimateProfile {...page.profile} />}
    />
  );
}
