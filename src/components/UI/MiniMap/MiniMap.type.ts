export type TMiniMapLocation = {
  lat: number;
  lng: number;
  label: string;
  color: string;
};

export type TMiniMapProps = {
  locations: TMiniMapLocation[];
  activeIndex?: number;
  onToggle?: (index: number) => void;
};
