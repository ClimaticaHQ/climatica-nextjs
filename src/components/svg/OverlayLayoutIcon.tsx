/** Two curves in one diagram — WL comparison "overlay" layout. Sized to match the chart-mode toggle icons. */
export function OverlayLayoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.5 9.5 L5 5.5 L8 8 L11.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 7 L5.5 9 L8.5 6 L11.5 8.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1.5 1.5"
      />
    </svg>
  );
}
