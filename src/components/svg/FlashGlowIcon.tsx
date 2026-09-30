/** A card with a soft outer glow — the "Glow" update highlight. Sized to the segmented icons. */
export function FlashGlowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect
        x="0.75"
        y="0.75"
        width="12.5"
        height="12.5"
        rx="3"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
