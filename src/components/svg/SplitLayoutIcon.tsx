/** Two diagrams side by side — WL comparison "split" layout. Sized to match the chart-mode toggle icons. */
export function SplitLayoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8" y="2" width="5" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2 9.5 L3.5 6.5 L5 8 M9 9.5 L10.5 6.5 L12 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
