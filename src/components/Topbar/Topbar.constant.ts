// * a navbar link's look: in the desktop row, and in the mobile menu (filled when current)
export const TOPBAR_LINK_CLASSES = {
  // * the desktop row's gap; narrower from lg to xl, so five links fit at 1024 px in most languages
  DESKTOP_ROW: "hidden gap-1 lg:flex xl:gap-3",
  DESKTOP:
    "rounded-[var(--radius-sm)] px-2.5 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 xl:px-4",
  DESKTOP_ACTIVE: "bg-[var(--color-primary-muted)] font-medium text-[var(--color-primary)]",
  MOBILE:
    "block w-full rounded-[var(--radius-sm)] px-4 py-3 text-[length:var(--font-sm)] transition-colors duration-150",
  MOBILE_ACTIVE: "bg-[var(--color-primary)] font-medium text-[var(--color-on-primary)]",
  IDLE: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]",
} as const;
