"use client";

import "leaflet/dist/leaflet.css";
import type { CircleMarker as LCircleMarker, Map as LMap } from "leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { TMiniMapLocation, TMiniMapProps } from "./MiniMap.type";

export function MiniMap({ locations, activeIndex, onToggle }: TMiniMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);
  const markersRef = useRef<LCircleMarker[]>([]);

  // Init once — guard prevents React Strict Mode double-invoke
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter: [number, number] =
      locations.length > 0 ? [locations[0].lat, locations[0].lng] : [0, 0];

    const map = L.map(containerRef.current, {
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

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const map = mapRef.current;

    markersRef.current = locations.map((loc: TMiniMapLocation, i: number) =>
      L.circleMarker([loc.lat, loc.lng], {
        radius: activeIndex === i ? 10 : 7,
        color: loc.color,
        fillColor: loc.color,
        fillOpacity: 0.9,
        weight: 2,
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
    <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)] shadow-sm sm:h-[160px] sm:w-[260px]">
      <div className="flex h-full flex-col">
        {showToggle && (
          <div className="shrink-0 flex justify-center border-b border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5">
            <div className="flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5">
              {locations.map((loc, i) => (
                <button
                  key={loc.label}
                  type="button"
                  onClick={() => onToggle?.(i)}
                  className={`rounded-full px-3 py-1 text-[length:var(--font-xs)] font-medium transition-colors duration-150 ${
                    activeIndex === i
                      ? "text-white"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  }`}
                  style={activeIndex === i ? { backgroundColor: loc.color } : undefined}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1">
          <div ref={containerRef} style={{ height: "100%" }} className="w-full" />
        </div>
      </div>
    </div>
  );
}
