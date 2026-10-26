import { ETheme } from "@/enums";

export function isTheme(value: unknown): value is ETheme {
  return Object.values(ETheme).some((theme) => theme === value);
}

/** Whether a theme draws dark: dark, or system on a device that prefers dark. */
export function isDarkTheme(theme: ETheme, prefersDark: boolean) {
  return theme === ETheme.DARK || (theme === ETheme.SYSTEM && prefersDark);
}

/** Shows the theme: dark is the `dark` class on <html>, which global.css keys off. */
export function applyDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle(ETheme.DARK, isDark);
}
