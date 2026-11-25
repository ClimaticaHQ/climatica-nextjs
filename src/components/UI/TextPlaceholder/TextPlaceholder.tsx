import { NO_BREAK_SPACE, TEXT_PLACEHOLDER_CLASS } from "./TextPlaceholder.constant";
import type { TTextPlaceholderProps } from "./TextPlaceholder.type";

export function TextPlaceholder({ widthClass }: TTextPlaceholderProps) {
  return (
    <span aria-hidden className={`${TEXT_PLACEHOLDER_CLASS} ${widthClass}`}>
      {NO_BREAK_SPACE}
    </span>
  );
}
