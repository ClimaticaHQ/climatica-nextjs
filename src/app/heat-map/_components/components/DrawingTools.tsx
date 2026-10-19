"use client";

import { CellCountBadge } from "@/components/filters/CellCountBadge";
import { RASTER_SELECTION_PATH_OPTIONS } from "@/constants";
import { countCellsInBounds, getPolygonBounds } from "@/utils/cellCount.util";
import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  Polygon,
  Polyline,
  Rectangle,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { DRAWING_CELL_COUNT_TOOLTIP_CLASS } from "../HeatMap.constant";
import type {
  TBboxDrawerProps,
  TBboxOutlineProps,
  TDrawingCellCountProps,
  TPolygonDrawerProps,
  TPolygonOutlineProps,
} from "../HeatMap.type";

const CLOSE_PX = 14;

/**
 * The cells the shape being drawn would load at the current resolution — for a polygon, its
 * whole box, which is what's read — turning into a warning past the cap.
 */
function DrawingCellCount({ vertices, gridSize }: TDrawingCellCountProps) {
  return (
    <Tooltip permanent direction="top" className={DRAWING_CELL_COUNT_TOOLTIP_CLASS}>
      <CellCountBadge count={countCellsInBounds(getPolygonBounds(vertices), gridSize)} />
    </Tooltip>
  );
}

export function BboxDrawer({ isDrawMode, gridSize, onBboxComplete }: TBboxDrawerProps) {
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
        color: "var(--color-brand)",
        fillOpacity: 0.12,
        weight: 2,
        dashArray: "6 4",
      }}
    >
      <DrawingCellCount vertices={[start, current]} gridSize={gridSize} />
    </Rectangle>
  );
}

export function BboxOutline({ bbox }: TBboxOutlineProps) {
  return (
    <Rectangle
      bounds={[
        [bbox.south, bbox.west],
        [bbox.north, bbox.east],
      ]}
      pathOptions={RASTER_SELECTION_PATH_OPTIONS}
    />
  );
}

export function PolygonDrawer({ gridSize, onPolygonComplete }: TPolygonDrawerProps) {
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
        pathOptions={{ color: "var(--color-brand)", weight: 2, dashArray: "6 4" }}
      >
        <DrawingCellCount vertices={previewPath} gridSize={gridSize} />
      </Polyline>
      {showClosingLine && (
        <Polyline
          positions={[cursor, vertices[0]]}
          pathOptions={{ color: "var(--color-brand)", weight: 1, dashArray: "4 4", opacity: 0.4 }}
        />
      )}
      {snapToFirst && (
        <CircleMarker
          center={vertices[0]}
          radius={8}
          pathOptions={{
            color: "var(--color-brand)",
            fillColor: "var(--color-brand)",
            fillOpacity: 0.4,
            weight: 2,
          }}
        />
      )}
    </>
  );
}

export function PolygonOutline({ vertices }: TPolygonOutlineProps) {
  return <Polygon positions={vertices} pathOptions={RASTER_SELECTION_PATH_OPTIONS} />;
}
