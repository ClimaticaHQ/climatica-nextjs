/**
 * Satori (next/og's ImageResponse renderer) does not support CSS custom
 * properties, so the brand colors from global.css are duplicated here as
 * literal hex values for use only inside the OG image route.
 */
export const OG_IMAGE_COLORS = {
  primary: "#1d9e75",
  dark: "#0f6e56",
  onPrimary: "#ffffff",
} as const;

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;
