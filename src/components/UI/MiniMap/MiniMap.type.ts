import type { TSeriesShape } from "@/types";

export type TMiniMapLocation = {
  lat: number;
  lng: number;
  label: string;
  /** a compared entity's shape; the first shape when the place is no entity */
  shape?: TSeriesShape;
};

export type TMiniMapProps = {
  locations: TMiniMapLocation[];
  activeIndex?: number;
  onToggle?: (index: number) => void;
};
