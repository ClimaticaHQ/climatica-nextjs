"use client";

import { useEffect, useRef, useState } from "react";
import { CircleMarker, Polygon, Polyline, Rectangle, useMap, useMapEvents } from "react-leaflet";
import type {
  TBboxDrawerProps,
  TBboxOutlineProps,
  TPolygonDrawerProps,
  TPolygonOutlineProps,
} from "../HeatMap.type";

const CLOSE_PX = 14;

export function BboxDrawer({ isDrawMode, onBboxComplete }: TBboxDrawerProps) {
  const map = useMap();
  const [start, setStart] = useState<[number, number] | null>(null);
  const [current, setCurrent] = useState<[number, number] | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const container = map.getContainer();
    if (isDrawMode) {
      map.dragging.disable();
      container.style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      container.style.cursor = "";
      isDragging.current = false;
    }
    return () => {
      map.dragging.enable();
      container.style.cursor = "";
    };
  }, [isDrawMode, map]);

  useMapEvents({
    mousedown(e) {
      if (!isDrawMode) return;
      isDragging.current = true;
      setStart([e.latlng.lat, e.latlng.lng]);
      setCurrent([e.latlng.lat, e.latlng.lng]);
    },
    mousemove(e) {
      if (!isDrawMode || !isDragging.current) return;
      setCurrent([e.latlng.lat, e.latlng.lng]);
    },
    mouseup(e) {
      if (!isDrawMode || !isDragging.current || !start) return;
      isDragging.current = false;
      onBboxComplete({
        north: Math.max(start[0], e.latlng.lat),
        south: Math.min(start[0], e.latlng.lat),
        east: Math.max(start[1], e.latlng.lng),
        west: Math.min(start[1], e.latlng.lng),
      });
      setStart(null);
      setCurrent(null);
    },
  });

  if (!isDrawMode || !start || !current) return null;

  return (
    <Rectangle
      bounds={[start, current]}
      pathOptions={{
        color: "var(--color-primary)",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      }}
    />
  );
}

export function BboxOutline({ bbox }: TBboxOutlineProps) {
  return (
    <Rectangle
      bounds={[
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ]}
      pathOptions={{ color: "var(--color-primary)", fillOpacity: 0, weight: 2 }}
    />
  );
}

export function PolygonDrawer({ onPolygonComplete }: TPolygonDrawerProps) {
  const map = useMap();
  const [vertices, setVertices] = useState<[number, number][]>([]);
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const [snapToFirst, setSnapToFirst] = useState(false);

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = "crosshair";
    return () => {
      container.style.cursor = "";
    };
  }, [map]);

  useMapEvents({
    mousemove(e) {
      const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setCursor(pos);
      if (vertices.length >= 3) {
        const first = map.latLngToContainerPoint(vertices[0]);
        const dx = first.x - e.containerPoint.x;
        const dy = first.y - e.containerPoint.y;
        setSnapToFirst(Math.sqrt(dx * dx + dy * dy) <= CLOSE_PX);
      } else {
        setSnapToFirst(false);
      }
    },
    click(e) {
      if (vertices.length >= 3) {
        const first = map.latLngToContainerPoint(vertices[0]);
        const dx = first.x - e.containerPoint.x;
        const dy = first.y - e.containerPoint.y;
        if (Math.sqrt(dx * dx + dy * dy) <= CLOSE_PX) {
          onPolygonComplete([...vertices]);
          return;
        }
      }
      setVertices((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    },
  });

  if (vertices.length === 0) return null;

  const previewPath: [number, number][] = cursor ? [...vertices, cursor] : vertices;
  const showClosingLine = cursor !== null && vertices.length >= 2;

  return (
    <>
      <Polyline
        positions={previewPath}
        pathOptions={{ color: "var(--color-primary)", weight: 2, dashArray: "6 4" }}
      />
      {showClosingLine && (
        <Polyline
          positions={[cursor, vertices[0]]}
          pathOptions={{ color: "var(--color-primary)", weight: 1, dashArray: "4 4", opacity: 0.4 }}
        />
      )}
      {snapToFirst && (
        <CircleMarker
          center={vertices[0]}
          radius={8}
          pathOptions={{
            color: "var(--color-primary)",
            fillColor: "var(--color-primary)",
            fillOpacity: 0.4,
            weight: 2,
          }}
        />
      )}
    </>
  );
}

export function PolygonOutline({ vertices }: TPolygonOutlineProps) {
  return (
    <Polygon
      positions={vertices}
      pathOptions={{ color: "var(--color-primary)", fillOpacity: 0, weight: 2 }}
    />
  );
}
