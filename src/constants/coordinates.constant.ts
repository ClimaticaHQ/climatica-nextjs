export const COORDINATE_REGEX = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;

export const LAT_BOUNDS = { MIN: -90, MAX: 90 } as const;
export const LNG_BOUNDS = { MIN: -180, MAX: 180 } as const;
