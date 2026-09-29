import type { TSeriesMarkerIconProps } from "./svg.type";

/** A series' marker — circle for A, square for B — drawn in currentColor. */
export function SeriesMarkerIcon({ shape }: TSeriesMarkerIconProps) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      {shape === "square" ? (
        <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" />
      ) : (
        <circle cx="7" cy="7" r="4.5" fill="currentColor" />
      )}
    </svg>
  );
}
