export const TOPBAR_LINK_CLASSES = {
  DESKTOP_ROW: "hidden shrink-0 lg:flex",
  // * narrower from lg to xl, so five links fit at 1024 px in most languages
  DESKTOP_LIST: "relative flex gap-1 xl:gap-3",
  DESKTOP_PILL:
    "pointer-events-none absolute top-0 left-0 rounded-[var(--radius-sm)] bg-[var(--color-primary-muted)]",
  DESKTOP_PILL_MOTION: "nav-indicator",
  // * out of the flow but still measured, so it can come back when it fits
  DESKTOP_ROW_COLLAPSED: "lg:invisible lg:absolute",
  MENU_ONLY_BELOW_LG: "lg:hidden",
  DESKTOP:
    "nav-indicator-text relative whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-2 text-[length:var(--font-sm)] font-medium xl:px-4",
  DESKTOP_ACTIVE: "text-[var(--color-primary)]",
  // * the highlight in the server's HTML, until the pill is measured and takes over
  DESKTOP_ACTIVE_STATIC: "bg-[var(--color-primary-muted)]",
  MOBILE:
    "flex min-h-target w-full items-center rounded-[var(--radius-sm)] px-4 py-3 text-[length:var(--font-sm)] transition-colors duration-150",
  MOBILE_ACTIVE: "bg-[var(--color-primary)] font-medium text-[var(--color-on-primary)]",
  IDLE: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]",
} as const;

export const TOPBAR_CLASSES = {
  HEADER:
    "relative box-content h-16 w-full shrink-0 border-b pt-[env(safe-area-inset-top)] border-[var(--color-border)] bg-[var(--color-surface)]",
  ROW: "flex h-full items-center pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
  LOGO: "touch-target flex flex-1 items-center gap-2.5 text-[var(--color-brand)] hover:opacity-80 transition-opacity duration-150",
  LOGO_MARK: "h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 shrink-0",
  LOGO_NAME:
    "text-[length:var(--font-md)] lg:text-[length:var(--font-lg)] font-semibold tracking-wide leading-none",
  CONTROLS: "flex flex-1 items-center justify-end gap-1",
  SETTINGS:
    "hidden h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-150 lg:flex",
  SETTINGS_ACTIVE: "bg-[var(--color-primary-muted)] text-[var(--color-primary)]",
  MENU_BUTTON:
    "touch-target flex size-[max(2.5rem,40px)] items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]",
} as const;

export const TOPBAR_MENU_CLASSES = {
  PANEL:
    "absolute left-0 right-0 top-full z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-md transition-all duration-300 ease-in-out",
  OPEN: "pointer-events-auto translate-y-0 opacity-100",
  CLOSED: "pointer-events-none -translate-y-2 opacity-0",
  LIST: "flex max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] list-none flex-col gap-1 overflow-y-auto pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
  SETTINGS_ITEM: "mt-2 border-t border-[var(--color-border)] pt-3",
} as const;
