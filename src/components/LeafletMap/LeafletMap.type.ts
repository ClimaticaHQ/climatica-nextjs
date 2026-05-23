import type { TCellBounds, TCellSize } from "@/types";

export type TLeafletMapProps = {
  lat: number;
  lng: number;
  label?: string;
  onMapClick: (lat: number, lng: number) => void;
  className?: string;
  cellBounds?: TCellBounds;
  gridSize?: TCellSize;
};
