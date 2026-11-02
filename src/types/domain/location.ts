export type TCoordinates = {
  lat: number;
  lng: number;
};

export type TCitySearchParams = {
  lang: string;
  query: string;
};

/** A reverse-geocoding lookup: the point, and the language its place name is wanted in */
export type TNearestCityParams = TCoordinates & { lang: string };

export type TCity = {
  id: string;
  label: string;
  description: string;
  lat: number;
  lng: number;
};
