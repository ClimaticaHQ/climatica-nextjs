"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { TMapFitterProps, TMapNavigatorProps } from "../HeatMap.type";

export function MapNavigator({ target }: TMapNavigatorProps) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], 10, { duration: 1 });
  }, [target, map]);
  return null;
}

export function MapFitter({ bbox }: TMapFitterProps) {
  const map = useMap();

  useEffect(() => {
    if (!bbox) return;
    const id = setTimeout(() => {
      map.fitBounds(
        [
          [bbox.south, bbox.west],
          [bbox.north, bbox.east],
        ],
        { padding: [32, 32] },
      );
    }, 100);
    return () => clearTimeout(id);
  }, [bbox, map]);

  return null;
}
