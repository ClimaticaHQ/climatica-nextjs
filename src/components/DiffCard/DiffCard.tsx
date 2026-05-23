import type { TDiffCardProps } from "./DiffCard.type";

export function DiffCard({ title, value, sub, valueColor }: TDiffCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">
        {title}
      </span>
      <span
        className="text-[length:var(--font-lg)] font-bold leading-snug"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </span>
      <span className="text-[length:var(--font-xs)] text-[var(--color-text-secondary)]">{sub}</span>
    </div>
  );
}
