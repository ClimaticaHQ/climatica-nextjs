import { FILTER_HINT_CLASSES } from "./FilterHint.constant";
import type { TFilterHintProps } from "./FilterHint.type";

/** A short note under a filter: an explanation, a muted aside, or an error. */
export function FilterHint({ text, variant, className, id }: TFilterHintProps) {
  return (
    <p id={id} className={`${FILTER_HINT_CLASSES[variant]}${className ? ` ${className}` : ""}`}>
      {text}
    </p>
  );
}
