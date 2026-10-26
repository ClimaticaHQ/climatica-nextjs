"use client";

import { SearchBar } from "@/components/SearchBar";
import { DotLabel, MapSkeleton, type TMiniMapLocation } from "@/components/UI";
import { EWalterLiethSeriesId } from "@/enums";
import { getPairShape } from "@/utils/seriesShape.util";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CITY_PAIR_SEARCH_CLASSES as C } from "./CompareCities.constant";
import type { TCityPairSearchProps, TCitySearchRowProps } from "./CompareCities.type";

const MiniMap = dynamic(
  () => import("@/components/UI/MiniMap/MiniMap").then((m) => ({ default: m.MiniMap })),
  { ssr: false, loading: () => <MapSkeleton variant="mini" /> },
);

function CitySearchRow({ label, markerShape, cityLabel, onCitySelect }: TCitySearchRowProps) {
  return (
    <div className={C.ROW}>
      <DotLabel label={label} markerShape={markerShape} />
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
    { city: cityA, shape: getPairShape(EWalterLiethSeriesId.A) },
    { city: cityB, shape: getPairShape(EWalterLiethSeriesId.B) },
  ].flatMap(({ city, shape }) =>
    city.lat && city.lng ? [{ lat: city.lat, lng: city.lng, label: city.label, shape }] : [],
  );

  return (
    <div className={C.ROOT}>
      <div className={C.SEARCHES}>
        <div className={C.SEARCH_GRID}>
          <CitySearchRow
            label={t("climateComparison.searchA")}
            markerShape={getPairShape(EWalterLiethSeriesId.A)}
            cityLabel={cityA.label}
            onCitySelect={onCityASelect}
          />
          <CitySearchRow
            label={t("climateComparison.searchB")}
            markerShape={getPairShape(EWalterLiethSeriesId.B)}
            cityLabel={cityB.label}
            onCitySelect={onCityBSelect}
          />
        </div>
      </div>
      <MiniMap locations={locations} activeIndex={activeCity} onToggle={setActiveCity} />
    </div>
  );
}
