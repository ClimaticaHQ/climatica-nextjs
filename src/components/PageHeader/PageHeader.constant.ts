// * every page's header: centred, the title in the primary colour, a short description below
export const PAGE_HEADER_CLASSES = {
  ROOT: "text-center",
  TITLE:
    "mb-2 text-[length:var(--font-xl)] font-bold text-[var(--color-primary)] lg:text-[length:var(--font-2xl)]",
  DESCRIPTION: "mt-1 text-[var(--color-text-secondary)]",
} as const;
