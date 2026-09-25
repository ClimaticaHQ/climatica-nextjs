/** A point in world-pixel space at a given zoom — origin at (0,0) = 90°N/-180°W,
 * axes increasing right/down, same convention as Leaflet's own CRS.Simple pixels. */
export type TPixelPoint = {
  x: number;
  y: number;
};

/** Inclusive tile index range (slippy-map x/y at a given zoom) covering a bbox. */
export type TTileRange = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

/** Result of resolveTileZoom() — how many zoom levels above a fitted zoom to
 * fetch basemap tiles at, and the resulting draw size, for sharper tiles at a
 * higher output pixel ratio without shifting where the vector overlays land. */
export type TTileZoomResolution = {
  /** The zoom actually used to fetch tile images — fittedZoom + zoomDelta. */
  tileZoom: number;

  /** How many zoom levels above fittedZoom the tiles are fetched at (0 or more) —
   * their world-pixel size is divided by 2^zoomDelta so they still align with
   * cells/selection, which stay projected at fittedZoom. */
  zoomDelta: number;
  
  /** Each tile's drawn size on the fittedZoom canvas: tileSizePx / 2^zoomDelta. */
  tileDrawSizePx: number;
};
