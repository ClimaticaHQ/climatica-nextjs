"use client";

import { interpolateColor } from "@/utils";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { THeatmapLayerProps } from "../HeatMap.type";
import { GRID_DELTA, iriToCellBounds, pixelAnnualAvg, pixelSelectedAvg } from "../HeatMap.util";

const isTouchDevice = "ontouchstart" in window;

function popupContent(value: number, unit: string, centerLat: number, centerLng: number): string {
  const latDir = centerLat >= 0 ? "N" : "S";
  const lngDir = centerLng >= 0 ? "E" : "W";
  return `<div style="font-size:13px;font-weight:500;">${value.toFixed(1)} ${unit}</div><div style="font-size:11px;opacity:.65;">${Math.abs(centerLat).toFixed(3)}°${latDir}, ${Math.abs(centerLng).toFixed(3)}°${lngDir}</div>`;
}

export function HeatmapLayer({
  bindings,
  gridSize,
  scale,
  unit,
  bbox,
  polygon,
  selectedMonths,
}: THeatmapLayerProps) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup | null>(null);
  const prevSelectionRef = useRef<{ bbox: typeof bbox; polygon: typeof polygon }>({
    bbox: null,
    polygon: null,
  });

  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    groupRef.current = group;
    return () => {
      group.remove();
      groupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();

    if (bindings.length === 0) return;

    const cellSize = GRID_DELTA[gridSize] ?? GRID_DELTA["10m"];

    const getValue = (b: (typeof bindings)[number]) =>
      selectedMonths.length > 0 ? pixelSelectedAvg(b, selectedMonths) : pixelAnnualAvg(b);
    const values = bindings.map(getValue).filter((v) => !isNaN(v));
    if (values.length === 0) return;

    const min = Math.min(...values);
    const max = Math.max(...values);

    for (const b of bindings) {
      const value = getValue(b);
      if (isNaN(value)) continue;

      const bLat = parseFloat(b.lat?.value ?? "");
      const bLng = parseFloat(b.lng?.value ?? "");
      let bounds: { north: number; south: number; west: number; east: number } | null = null;

      if (!isNaN(bLat) && !isNaN(bLng)) {
        bounds = {
          north: bLat + cellSize / 2,
          south: bLat - cellSize / 2,
          west: bLng - cellSize / 2,
          east: bLng + cellSize / 2,
        };
      } else {
        const iri = b.pixel?.value;
        if (iri) bounds = iriToCellBounds(iri, cellSize);
      }

      if (!bounds) continue;

      const color = interpolateColor(value, min, max, scale);
      const leafletBounds = L.latLngBounds(
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      );
      const rect = L.rectangle(leafletBounds, {
        fillColor: color,
        fillOpacity: 0.55,
        stroke: false,
        weight: 0,
      }).addTo(group);

      const center = leafletBounds.getCenter();
      const content = popupContent(value, unit, center.lat, center.lng);
      const popup = L.popup({ closeButton: false, offset: [0, -4] }).setContent(content);

      if (isTouchDevice) {
        rect.on("click", (e) => {
          popup.setLatLng(e.latlng).openOn(map);
        });
      } else {
        rect.on("mouseover", (e) => {
          popup.setLatLng(e.latlng).openOn(map);
        });
        rect.on("mouseout", () => {
          map.closePopup();
        });
      }
    }

    const selectionChanged =
      prevSelectionRef.current.bbox !== bbox || prevSelectionRef.current.polygon !== polygon;
    prevSelectionRef.current = { bbox, polygon };

    if (!selectionChanged) return;

    if (bbox) {
      map.fitBounds(
        [
          [bbox.south, bbox.west],
          [bbox.north, bbox.east],
        ],
        { padding: [24, 24] },
      );
    } else if (polygon && polygon.length >= 2) {
      const lats = polygon.map(([lat]) => lat);
      const lngs = polygon.map(([, lng]) => lng);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [24, 24] },
      );
    }
  }, [bindings, gridSize, scale, unit, bbox, polygon, selectedMonths, map]);

  return null;
}
