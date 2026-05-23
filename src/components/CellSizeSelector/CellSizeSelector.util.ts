import type { TCellSize } from "@/types";

export function getButtonClasses(activeSize: TCellSize, value: TCellSize) {
  const baseClasses = `
      px-3 py-2 md:py-1.5
      text-[length:var(--font-xs)] md:text-[length:var(--font-sm)]
      rounded-[var(--radius-sm)] border  
      transition-all duration-150 
      cursor-pointer
    `;

  const activeClasses = `bg-[var(--color-primary)] text-white border-transparent`;

  const inactiveClasses = `
      bg-[var(--color-bg)] 
      text-[var(--color-text-secondary)] hover:text-[var(--color-secondary)]
      border-[var(--color-border)] hover:border-[var(--color-secondary)]
    `;

  return `${baseClasses} ${activeSize === value ? activeClasses : inactiveClasses}`;
}
