import type { TDotLabelProps } from "./DotLabel.type";

export function DotLabel({ label, dotColor, hideDot }: TDotLabelProps) {
  return (
    <div className="flex items-center gap-2">
      {!hideDot && (
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
          aria-hidden="true"
        />
      )}
      <span className="text-[length:var(--font-sm)] font-medium text-[var(--color-text-secondary)]">
        {label}
      </span>
    </div>
  );
}
