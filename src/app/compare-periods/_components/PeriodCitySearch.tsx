"use client";

import { LocationSearch } from "@/components/LocationSearch";
import { DotLabel, MapSkeleton } from "@/components/UI";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { PERIOD_CITY_SEARCH_CLASSES as C } from "./ComparePeriods.constant";
import type { TPeriodCitySearchProps } from "./ComparePeriods.type";

const MiniMap = dynamic(
  () => import("@/components/UI/MiniMap/MiniMap").then((m) => ({ default: m.MiniMap })),
  { ssr: false, loading: () => <MapSkeleton variant="mini" /> },
);

/**
 * The one city both periods belong to: its search (and your location), and the mini map. The
 * city is no compared entity, so its label has no marker.
 */
export function PeriodCitySearch({ city, ...search }: TPeriodCitySearchProps) {
  const t = useTranslations();
  return (
    <div className={C.ROOT}>
      <div className={C.SEARCH}>
        <div className={C.ROW}>
          <DotLabel label={t("climateComparison.searchCity")} />
          <LocationSearch key={city.id} {...search} />
        </div>
      </div>
      {city.lat && city.lng && (
        <MiniMap
          locations={[{ lat: city.lat, lng: city.lng, label: city.label }]}
          activeIndex={0}
          onToggle={() => undefined}
        />
      )}
    </div>
  );
}
