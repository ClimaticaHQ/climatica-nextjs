/**
 * Satori (next/og's ImageResponse renderer) does not support CSS custom
 * properties, so the brand colors from tokens.css are duplicated here as
 * literal hex values for use only inside the OG image route.
 */
export const OG_IMAGE_COLORS = {
  primary: "#22a274",
  dark: "#10835b",
  onPrimary: "#ffffff",
} as const;

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;
