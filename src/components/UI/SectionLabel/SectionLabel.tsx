import { SECTION_LABEL_TEXT } from "./SectionLabel.constant";
import type { TSectionLabelProps } from "./SectionLabel.type";

export function SectionLabel({ text }: TSectionLabelProps) {
  return (
    <p
      className={`mb-2 uppercase text-[var(--color-text-secondary)] ${SECTION_LABEL_TEXT}`}
      suppressHydrationWarning
    >
      {text}
    </p>
  );
}
