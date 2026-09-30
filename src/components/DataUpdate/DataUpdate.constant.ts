export const DATA_UPDATE_CLASSES = {
  ANNOUNCER: "sr-only",
  // * along the card's top edge, inside its border; the card's rounded overflow clips it
  PROGRESS_TRACK:
    "update-progress-track pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden",
  // * its width, travel and cycle are in motion.css
  PROGRESS_SEGMENT: "update-progress h-full bg-[var(--color-primary)]",
  // * dimmed while aria-busy (motion.css)
  FADE: "update-fade",
  // * isolate: content with its own z-indexes (Leaflet's panes) stays under the progress bar
  FULL_HEIGHT: "isolate h-full",
} as const;
