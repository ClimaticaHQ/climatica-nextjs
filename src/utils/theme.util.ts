import { ETheme } from "@/enums";

export function isTheme(value: unknown): value is ETheme {
  return Object.values(ETheme).some((theme) => theme === value);
}

export function isDarkTheme(theme: ETheme, prefersDark: boolean) {
  return theme === ETheme.DARK || (theme === ETheme.SYSTEM && prefersDark);
}

export function applyDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle(ETheme.DARK, isDark);
}
