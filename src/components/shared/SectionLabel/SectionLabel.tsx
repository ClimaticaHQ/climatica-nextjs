import type { TSectionLabelProps } from "./SectionLabel.type";

export function SectionLabel({ text }: TSectionLabelProps) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
      {text}
    </p>
  );
}
