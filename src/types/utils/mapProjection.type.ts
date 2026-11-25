/** origin 90°N / 180°W, axes right and down: Leaflet's CRS.Simple pixel convention */
export type TPixelPoint = {
  x: number;
  y: number;
};

export type TTileRange = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type TTileZoomResolution = {
  tileZoom: number;

  zoomDelta: number;

  tileDrawSizePx: number;
};
