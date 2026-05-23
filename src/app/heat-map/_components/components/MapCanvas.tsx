"use client";

import { ThreeDotsScaleLoader } from "@/components";
import { DEFAULT_HEATMAP_LOCATION } from "@/constants";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import type { TMapCanvasProps } from "../HeatMap.type";
import { BboxDrawer, BboxOutline, PolygonDrawer, PolygonOutline } from "./DrawingTools";
import { HeatmapLayer } from "./HeatmapLayer";
import { MapFitter, MapNavigator } from "./MapNavigator";

export function MapCanvas({
  bbox,
  polygon,
  drawMode,
  gridSize,
  colorScale,
  unit,
  mapTarget,
  bindings,
  isLoading,
  selectedMonths,
  onBboxComplete,
  onPolygonComplete,
}: TMapCanvasProps) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-md h-[70vh] sm:h-[520px]">
      {isLoading && (
        <div className="absolute inset-0 z-[1500] flex flex-col items-center justify-center gap-3 bg-[var(--color-bg)]/70 backdrop-blur-sm">
          <ThreeDotsScaleLoader className="text-[var(--color-primary)]" size={80} />
        </div>
      )}
      <MapContainer
        center={DEFAULT_HEATMAP_LOCATION}
        zoom={8}
        className="w-full h-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFitter bbox={bbox} />
        <MapNavigator target={mapTarget} />

        <BboxDrawer isDrawMode={drawMode === "bbox"} onBboxComplete={onBboxComplete} />

        {/* PolygonDrawer mounts only when active — unmounting resets its vertex state */}
        {drawMode === "polygon" && <PolygonDrawer onPolygonComplete={onPolygonComplete} />}

        {bbox && drawMode !== "bbox" && <BboxOutline bbox={bbox} />}
        {polygon && drawMode !== "polygon" && <PolygonOutline vertices={polygon} />}

        <HeatmapLayer
          bindings={bindings}
          gridSize={gridSize}
          scale={colorScale}
          unit={unit}
          bbox={bbox}
          polygon={polygon}
          selectedMonths={selectedMonths}
        />
      </MapContainer>
    </div>
  );
}
