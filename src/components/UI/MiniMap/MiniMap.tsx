"use client";

import type { Map as LMap, Marker as LMarker } from "leaflet";
import { Card } from "@/components/Card";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ECardPadding, ESegmentedSize } from "@/enums";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { OptionMarker } from "@/components/UI/Dropdown/OptionMarker";
import { MINI_MAP_TOGGLE_BAR_CLASS } from "./MiniMap.constant";
import type { TMiniMapLocation, TMiniMapProps } from "./MiniMap.type";
import { getMiniMapIcon } from "./MiniMap.util";

export function MiniMap({ locations, activeIndex, onToggle }: TMiniMapProps) {
  const t = useTranslations("map");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);
  const markersRef = useRef<LMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: LMap | null = null;

    function initMap(container: HTMLDivElement) {
      if (mapRef.current) return;
      if (container.offsetWidth === 0 || container.offsetHeight === 0) return;

      const initialCenter: [number, number] =
        locations.length > 0 ? [locations[0].lat, locations[0].lng] : [0, 0];

      map = L.map(container, {
        center: initialCenter,
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        keyboard: false,
        boxZoom: false,
        touchZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      mapRef.current = map;

      setTimeout(() => map?.invalidateSize(), 0);
    }

    const container = containerRef.current;

    initMap(container);

    const observer = new ResizeObserver(() => {
      if (!mapRef.current) {
        initMap(container);
      } else {
        mapRef.current.invalidateSize();
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;
    const map = mapRef.current;

    try {
      map.getContainer();
    } catch {
      return;
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markersRef.current = locations.map((loc: TMiniMapLocation, i: number) =>
      L.marker([loc.lat, loc.lng], {
        icon: getMiniMapIcon(loc.shape, activeIndex === i),
        keyboard: false,
        interactive: false,
      }).addTo(map),
    );

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 10);
    } else {
      const latLngs: [number, number][] = locations.map((loc) => [loc.lat, loc.lng]);
      map.fitBounds(latLngs, { padding: [24, 24] });
    }
  }, [locations, activeIndex]);

  if (locations.length === 0) return null;

  const showToggle = locations.length === 2;

  return (
    <Card
      padding={ECardPadding.NONE}
      shouldClip
      className="h-[120px] w-full shrink-0 sm:h-[160px] sm:w-[260px]"
    >
      <div className="flex h-full flex-col">
        {showToggle && (
          <div className={MINI_MAP_TOGGLE_BAR_CLASS}>
            {/* * values are the places' indexes: two places may share a label */}
            <SegmentedControl
              label={t("highlightedPlace")}
              options={locations.map((loc, i) => ({
                value: String(i),
                label: loc.label,
                icon: loc.shape && <OptionMarker shape={loc.shape} />,
              }))}
              value={String(activeIndex ?? 0)}
              onChange={(value) => onToggle?.(Number(value))}
              size={ESegmentedSize.COMPACT}
              isLabelTruncated
            />
          </div>
        )}

        <div className="min-h-0 flex-1">
          <div ref={containerRef} style={{ height: "100%" }} className="w-full" />
        </div>
      </div>
    </Card>
  );
}
