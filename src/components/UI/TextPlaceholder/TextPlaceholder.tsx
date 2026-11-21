import { NO_BREAK_SPACE, TEXT_PLACEHOLDER_CLASS } from "./TextPlaceholder.constant";
import type { TTextPlaceholderProps } from "./TextPlaceholder.type";

/**
 * A value that hasn't loaded yet, in its place: as tall as a line of the text around it, so the
 * value replaces it without moving anything. Hidden from screen readers (the region says it is
 * loading).
 */
export function TextPlaceholder({ widthClass }: TTextPlaceholderProps) {
  return (
    <span aria-hidden className={`${TEXT_PLACEHOLDER_CLASS} ${widthClass}`}>
      {NO_BREAK_SPACE}
    </span>
  );
}
