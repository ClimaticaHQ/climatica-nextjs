import { EBadgeSize } from "@/enums";
import { OptionDot } from "../Dropdown/OptionDot";
import { BADGE_CLASSES as C } from "./Badge.constant";
import type { TBadgeProps } from "./Badge.type";

/** A non-interactive label in one tint set's colours: background, 1px border and text. */
export function Badge({
  tone,
  size = EBadgeSize.MD,
  dotColor,
  isTruncated = false,
  title,
  children,
}: TBadgeProps) {
  return (
    <span
      className={`${C.BASE} ${C.SIZE[size]} ${isTruncated ? C.TRUNCATED : ""}`}
      style={{ backgroundColor: tone.bg, borderColor: tone.border, color: tone.text }}
      title={title}
    >
      {dotColor && <OptionDot color={dotColor} />}
      {isTruncated ? <span className={C.TRUNCATED_CONTENT}>{children}</span> : children}
    </span>
  );
}
