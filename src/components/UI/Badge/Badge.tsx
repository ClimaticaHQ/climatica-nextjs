import { EBadgeSize } from "@/enums";
import { OptionMarker } from "../Dropdown/OptionMarker";
import { BADGE_CLASSES as C, PENDING_BADGE_TONE } from "./Badge.constant";
import type { TBadgeProps } from "./Badge.type";

/** A non-interactive label in one tint set's colours: background, 1px border and text. */
export function Badge({
  tone,
  size = EBadgeSize.MD,
  markerShape,
  isTruncated = false,
  title,
  isPending = false,
  children,
}: TBadgeProps) {
  const colors = isPending ? PENDING_BADGE_TONE : tone;
  return (
    <span
      className={`${C.BASE} ${C.SIZE[size]} ${isTruncated ? C.TRUNCATED : ""} ${isPending ? C.PENDING : ""}`}
      style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
      title={isPending ? undefined : title}
      data-badge-size={size}
      {...(isPending ? { "aria-hidden": true } : {})}
    >
      {markerShape && <OptionMarker shape={markerShape} />}
      {isTruncated ? <span className={C.TRUNCATED_CONTENT}>{children}</span> : children}
    </span>
  );
}
