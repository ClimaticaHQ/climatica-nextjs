import { TWorldClimAvgBoxBinding, TWorldClimAvgBoxResponse, TWorldClimBoxResponse } from "../api";

export type TBbox = {
  north: number;
  south: number;
  west: number;
  east: number;
};

export type THeatmapResult = {
  pixels: TWorldClimBoxResponse;
  avg: TWorldClimAvgBoxResponse;
};

export type TPolygonResult = {
  pixels: TWorldClimBoxResponse;
  avg: TWorldClimAvgBoxResponse;
};

export type TProfileResult = {
  tmax: TWorldClimAvgBoxBinding | null;
  tmin: TWorldClimAvgBoxBinding | null;
  prec: TWorldClimAvgBoxBinding | null;
};
