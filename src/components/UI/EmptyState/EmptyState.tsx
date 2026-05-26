import type { TEmptyStateProps } from "./EmptyState.type";

export function EmptyState({ message, suppressHydrationWarning }: TEmptyStateProps) {
  return (
    <p
      className="text-center text-[var(--color-text-secondary)]"
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {message}
    </p>
  );
}
