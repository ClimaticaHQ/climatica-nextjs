"use client";

import { SearchBar } from "@/components/SearchBar";
import { DotLabel, MapSkeleton, type TMiniMapLocation } from "@/components/UI";
import { CLIMATE_COMPARISON_COLORS } from "@/constants";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CITY_PAIR_SEARCH_CLASSES as C } from "./CompareCities.constant";
import type { TCityPairSearchProps, TCitySearchRowProps } from "./CompareCities.type";

const MiniMap = dynamic(
  () => import("@/components/UI/MiniMap/MiniMap").then((m) => ({ default: m.MiniMap })),
  { ssr: false, loading: () => <MapSkeleton variant="mini" /> },
);

function CitySearchRow({ label, dotColor, cityLabel, onCitySelect }: TCitySearchRowProps) {
  return (
    <div className={C.ROW}>
      <DotLabel label={label} dotColor={dotColor} />
      <SearchBar cityLabel={cityLabel} onCitySelect={onCitySelect} />
    </div>
  );
}

/** City A's and city B's searches, and the mini map showing both (one active at a time). */
export function CityPairSearch({
  cityA,
  cityB,
  onCityASelect,
  onCityBSelect,
}: TCityPairSearchProps) {
  const t = useTranslations();
  const [activeCity, setActiveCity] = useState(0);
  const locations: TMiniMapLocation[] = [
    { city: cityA, color: CLIMATE_COMPARISON_COLORS.A.tmax },
    { city: cityB, color: CLIMATE_COMPARISON_COLORS.B.tmax },
  ].flatMap(({ city, color }) =>
    city.lat && city.lng ? [{ lat: city.lat, lng: city.lng, label: city.label, color }] : [],
  );

  return (
    <div className={C.ROOT}>
      <div className={C.SEARCHES}>
        <div className={C.SEARCH_GRID}>
          <CitySearchRow
            label={t("climateComparison.searchA")}
            dotColor={CLIMATE_COMPARISON_COLORS.A.tmax}
            cityLabel={cityA.label}
            onCitySelect={onCityASelect}
          />
          <CitySearchRow
            label={t("climateComparison.searchB")}
            dotColor={CLIMATE_COMPARISON_COLORS.B.tmax}
            cityLabel={cityB.label}
            onCitySelect={onCityBSelect}
          />
        </div>
      </div>
      <MiniMap locations={locations} activeIndex={activeCity} onToggle={setActiveCity} />
    </div>
  );
}
