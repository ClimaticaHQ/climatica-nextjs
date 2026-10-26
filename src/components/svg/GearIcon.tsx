import type { TIconProps } from "./svg.type";

/** A cog — opens the settings. Eight teeth on the 20 × 20 grid of the theme and filter icons. */
export function GearIcon({ className = "h-5 w-5" }: TIconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M8.61 3.75L8.67 1.6A8.5 8.5 0 0 1 11.33 1.6L11.39 3.75A6.4 6.4 0 0 1 13.44 4.6L15 3.12A8.5 8.5 0 0 1 16.88 5L15.4 6.56A6.4 6.4 0 0 1 16.25 8.61L18.4 8.67A8.5 8.5 0 0 1 18.4 11.33L16.25 11.39A6.4 6.4 0 0 1 15.4 13.44L16.88 15A8.5 8.5 0 0 1 15 16.88L13.44 15.4A6.4 6.4 0 0 1 11.39 16.25L11.33 18.4A8.5 8.5 0 0 1 8.67 18.4L8.61 16.25A6.4 6.4 0 0 1 6.56 15.4L5 16.88A8.5 8.5 0 0 1 3.12 15L4.6 13.44A6.4 6.4 0 0 1 3.75 11.39L1.6 11.33A8.5 8.5 0 0 1 1.6 8.67L3.75 8.61A6.4 6.4 0 0 1 4.6 6.56L3.12 5A8.5 8.5 0 0 1 5 3.12L6.56 4.6A6.4 6.4 0 0 1 8.61 3.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
