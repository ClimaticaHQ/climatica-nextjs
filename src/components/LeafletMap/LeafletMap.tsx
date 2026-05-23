"use client";

import { CELL_SIZE_OPTIONS } from "@/constants";
import type { Map as LMap, Marker as LMarker, Rectangle as LRectangle } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { TLeafletMapProps } from "./LeafletMap.type";

const MARKER_ICON = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:var(--color-primary);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

export function LeafletMap({
  lat,
  lng,
  label,
  onMapClick,
  className = "",
  cellBounds,
  gridSize,
}: TLeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LMap | null>(null);
  const markerRef = useRef<LMarker | null>(null);
  const rectRef = useRef<LRectangle | null>(null);
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Init once — guard prevents React Strict Mode double-invoke
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { center: [lat, lng], zoom: 10 });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([lat, lng], { icon: MARKER_ICON });
    if (label) marker.bindPopup(label);
    marker.addTo(map);
    markerRef.current = marker;

    map.on("click", (e) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      rectRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([lat, lng], 10, { duration: 1.5 });
    markerRef.current?.setLatLng([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    if (!markerRef.current) return;
    if (label) {
      markerRef.current.bindPopup(label);
    } else {
      markerRef.current.unbindPopup();
    }
  }, [label]);

  useEffect(() => {
    rectRef.current?.remove();
    rectRef.current = null;

    if (!mapRef.current || !cellBounds) return;

    const bounds: [[number, number], [number, number]] = [
      [cellBounds.south, cellBounds.west],
      [cellBounds.north, cellBounds.east],
    ];
    const areaMatch = gridSize ? /\(~[^)]+\)/.exec(CELL_SIZE_OPTIONS[gridSize]) : null;
    const area = areaMatch ? ` ${areaMatch[0]}` : "";

    const rect = L.rectangle(bounds, {
      color: "var(--color-primary)",
      weight: 1.5,
      fillColor: "var(--color-primary)",
      fillOpacity: 0.08,
      dashArray: "4 4",
    });
    rect.bindTooltip(`Grid cell: ${gridSize ?? ""}${area}`, { sticky: true });
    rect.addTo(mapRef.current);
    rectRef.current = rect;
  }, [cellBounds, gridSize]);

  return (
    <div
      className={`relative z-0 overflow-hidden border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-md ${className}`}
    >
      <div ref={containerRef} className="w-full h-[400px]" />
    </div>
  );
}
