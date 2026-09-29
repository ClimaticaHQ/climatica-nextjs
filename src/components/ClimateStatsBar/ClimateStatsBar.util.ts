export const formatMartonne = (value: number | null) => (value !== null ? value.toFixed(1) : "—");

export const formatAltitude = (value: number | undefined) =>
  value !== undefined ? `${value} m` : "—";
