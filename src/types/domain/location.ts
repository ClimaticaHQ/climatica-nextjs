export type TCoordinates = {
  lat: number;
  lng: number;
};

export type TCitySearchParams = {
  lang: string;
  query: string;
};

export type TWikidataCity = {
  id: string;
  label: string;
  description: string;
  lat: number;
  lng: number;
};
