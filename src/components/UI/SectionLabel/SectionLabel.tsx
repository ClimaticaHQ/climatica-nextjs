import { ETextScale } from "@/enums";
import { SECTION_LABEL_SCALE_CLASSES } from "./SectionLabel.constant";
import type { TSectionLabelProps } from "./SectionLabel.type";

export function SectionLabel({ text, textScale = ETextScale.DEFAULT }: TSectionLabelProps) {
  return (
    <p
      className={`mb-2 uppercase text-[var(--color-text-secondary)] ${SECTION_LABEL_SCALE_CLASSES[textScale]}`}
      suppressHydrationWarning
    >
      {text}
    </p>
  );
}
