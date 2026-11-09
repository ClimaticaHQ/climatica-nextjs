// * a navbar link's look: in the desktop row, and in the mobile menu (filled when current)
export const TOPBAR_LINK_CLASSES = {
  // * the desktop row's gap; narrower from lg to xl, so five links fit at 1024 px in most languages.
  // * One line, never squeezed: when it doesn't fit (useNavbarFit) it collapses into the menu
  DESKTOP_ROW: "hidden shrink-0 gap-1 lg:flex xl:gap-3",
  // * collapsed: out of the flow and unseen, still measured — so it can come back when it fits
  DESKTOP_ROW_COLLAPSED: "lg:invisible lg:absolute",
  // * the menu button and the menu: below lg, and from lg while the links are collapsed
  MENU_ONLY_BELOW_LG: "lg:hidden",
  DESKTOP:
    "whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-2 text-[length:var(--font-sm)] font-medium transition-colors duration-150 xl:px-4",
  DESKTOP_ACTIVE: "bg-[var(--color-primary-muted)] font-medium text-[var(--color-primary)]",
  MOBILE:
    "flex min-h-target w-full items-center rounded-[var(--radius-sm)] px-4 py-3 text-[length:var(--font-sm)] transition-colors duration-150",
  MOBILE_ACTIVE: "bg-[var(--color-primary)] font-medium text-[var(--color-on-primary)]",
  IDLE: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] hover:text-[var(--color-text)]",
} as const;

// * the bar itself: the logo, the links (or the menu button) and the controls on one row
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

// * the menu, dropped under the bar
export const TOPBAR_MENU_CLASSES = {
  PANEL:
    "absolute left-0 right-0 top-full z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-md transition-all duration-300 ease-in-out",
  OPEN: "pointer-events-auto translate-y-0 opacity-100",
  CLOSED: "pointer-events-none -translate-y-2 opacity-0",
  LIST: "flex max-h-[calc(100dvh-4rem-env(safe-area-inset-top))] list-none flex-col gap-1 overflow-y-auto pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
  // * Settings, apart from the pages under a rule
  SETTINGS_ITEM: "mt-2 border-t border-[var(--color-border)] pt-3",
} as const;
