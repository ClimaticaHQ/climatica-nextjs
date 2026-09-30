"use client";

import { Card } from "@/components";
import { DataUpdateFade, DataUpdateProgress } from "@/components/DataUpdate";
import { DEFAULT_HEATMAP_LOCATION, HEATMAP_MAP_CONFIG } from "@/constants";
import { ECardElevation, ECardPadding } from "@/enums";
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
  selectedMonths,
  onBboxComplete,
  onPolygonComplete,
}: TMapCanvasProps) {
  return (
    <Card
      padding={ECardPadding.NONE}
      elevation={ECardElevation.RAISED}
      shouldClip
      className="relative h-[70vh] sm:h-[520px]"
    >
      {/* * loading: the map dims and the progress bar runs along its top edge, like a chart card;
          the previous cells stay until the new ones arrive */}
      <DataUpdateProgress />
      <DataUpdateFade isFullHeight>
        <MapContainer
          center={DEFAULT_HEATMAP_LOCATION}
          zoom={HEATMAP_MAP_CONFIG.zoom}
          className="w-full h-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution={HEATMAP_MAP_CONFIG.attribution}
            url={HEATMAP_MAP_CONFIG.url}
            crossOrigin={true}
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
      </DataUpdateFade>
    </Card>
  );
}
