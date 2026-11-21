import type { TActiveSectionArgs } from "@/types";

/**
 * The current section's index: the last whose top has crossed the line. Sections too near the
 * end to ever reach it share the scroll left after the last one that can, in order, so each is
 * current for a while; at the very end the last one is.
 */
export function getActiveSectionIndex({
  tops,
  scrollTop,
  maxScroll,
  line,
  endTolerance,
}: TActiveSectionArgs) {
  const last = tops.length - 1;
  if (last < 0) return -1;
  if (scrollTop >= maxScroll - endTolerance) return last;

  const starts = tops.map((top) => top - line);
  const lastReachable = Math.max(
    0,
    starts.findLastIndex((start) => start <= maxScroll),
  );
  const tailStart = Math.min(Math.max(starts[lastReachable] ?? 0, 0), maxScroll);
  const tailCount = last - lastReachable;

  if (tailCount > 0 && scrollTop >= tailStart && maxScroll > tailStart) {
    const progress = (scrollTop - tailStart) / (maxScroll - tailStart);
    return Math.min(last, lastReachable + Math.floor(progress * (tailCount + 1)));
  }
  return Math.max(
    0,
    starts.findLastIndex((start) => start <= scrollTop),
  );
}
