export const DATA_UPDATE_CLASSES = {
  ANNOUNCER: "sr-only",
  PROGRESS_TRACK:
    "update-progress-track pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden",
  PROGRESS_SEGMENT: "update-progress h-full bg-[var(--color-brand)]",
  FADE: "update-fade",
  // * isolate: content with its own z-indexes (Leaflet's panes) stays under the progress bar
  FULL_HEIGHT: "isolate h-full",
} as const;
