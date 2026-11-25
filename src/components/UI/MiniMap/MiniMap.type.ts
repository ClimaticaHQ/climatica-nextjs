import type { TSeriesShape } from "@/types";

export type TMiniMapLocation = {
  lat: number;
  lng: number;
  label: string;
  shape?: TSeriesShape;
};

export type TMiniMapProps = {
  locations: TMiniMapLocation[];
  activeIndex?: number;
  onToggle?: (index: number) => void;
};
